'use strict';

var DefaultEventPluginOrder = require('react/lib/DefaultEventPluginOrder');
var DOMPropertyOperations = require('react/lib/DOMPropertyOperations');
var EventConstants = require('react/lib/EventConstants');
var EventPluginRegistry = require('react/lib/EventPluginRegistry');
var EventPluginUtils = require('react/lib/EventPluginUtils');
var EventPropagators = require('react/lib/EventPropagators');
var ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter');
var ReactInjection = require('react/lib/ReactInjection');
var SyntheticEvent = require('react/lib/SyntheticEvent');
var keyOf = require('fbjs/lib/keyOf');
var Polymer = global.Polymer;


function isPolymerElement(element) {
  return element.nodeName && element.nodeName.indexOf('-') !== -1;
}

var customTopLevelTypes = {};
var CustomPlugin = {
  eventTypes: {},

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent,
      nativeEventTarget) {
    if (!customTopLevelTypes.hasOwnProperty(topLevelType) ||
        !isPolymerElement(topLevelTarget)) {
      return null;
    }
    var event = SyntheticEvent.getPooled(
      customTopLevelTypes[topLevelType],
      topLevelTargetID,
      nativeEvent,
      nativeEventTarget
    );
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  },
};


var registeredEvents = [];
var monkeyPatchedExisting = [];

/**
 * Register an event to listen for on Polymer elements.
 * @param {string} name the event name (e.g. 'change')
 * @param {object|string} bubbled listener attribute name as an object key (e.g. {onChange: true})
 * @param {object|string} captured capturing listener attribute name as an object key (e.g. {onChangeCapture: true})
 */
function registerEvent(name, bubbled, captured) {
  injectAll();
  if (typeof bubbled !== 'string') {
    bubbled = keyOf(bubbled);
  }
  if (typeof captured !== 'string') {
    captured = captured != null ? keyOf(captured) : bubbled + 'Captured';
  }

  if (registeredEvents.some(function(reg) {
        return reg.name === name || reg.bubbled === bubbled;
      })) {
    return;
  }
  registeredEvents.push({name: name, bubbled: bubbled});

  var topLevelType = 'topCustom' + bubbled;
  var dispatchConfig = {
    phasedRegistrationNames: {
      bubbled: bubbled,
      captured: captured,
    },
    dependencies: [topLevelType],
  };

  var existing = EventPluginRegistry.registrationNameModules[bubbled];
  if (existing) {
    if (monkeyPatchedExisting.indexOf(existing) !== -1) return;
    monkeyPatchedExisting.push(existing);

    //monkey-patch over existing function
    var previous = existing.extractEvents;

    existing.extractEvents = function(
        localTopLevelType,
        topLevelTarget,
        topLevelTargetID,
        nativeEvent,
        nativeEventTarget) {
      if (nativeEvent.type !== name || !isPolymerElement(topLevelTarget)) {
        return previous(localTopLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget);
      }
      var event = SyntheticEvent.getPooled(
        dispatchConfig,
        topLevelTargetID,
        nativeEvent,
        nativeEventTarget
      );
      EventPropagators.accumulateTwoPhaseDispatches(event);
      return event;
    };

    return;
  }

  EventConstants.topLevelTypes[topLevelType] = topLevelType;

  ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
    topLevelType,
    name,
    document
  );

  CustomPlugin.eventTypes[bubbled] =
      EventPluginRegistry.eventNameDispatchConfigs[bubbled] =
      customTopLevelTypes[topLevelType] = dispatchConfig;

  EventPluginRegistry.registrationNameModules[bubbled] =
      EventPluginRegistry.registrationNameModules[captured] = CustomPlugin;

  EventPluginRegistry.registrationNameDependencies[bubbled] =
      EventPluginRegistry.registrationNameDependencies[captured] =
      dispatchConfig.dependencies;
}

var attributes = [];

/**
 * Register a custom attribute of native elements.
 * @param string name the attribute name
 */
function registerAttribute(name) {
  injectAll();
  if (attributes.indexOf(name) !== -1) {
    return;
  }
  attributes.push(name);
}


var isInjected = false;
function injectAll() {
  if (isInjected) {
    return;
  }
  isInjected = true;

  require('react'); //make sure it's loaded
  ReactInjection.EventPluginHub.injectEventPluginsByName({CustomPlugin: CustomPlugin});

  ReactInjection.DOMProperty.injectDOMPropertyConfig({
    isCustomAttribute: function(name) {
      return attributes.indexOf(name) !== -1;
    }
  });
}

if (EventPluginUtils.injection.Mount) {
  throw new Error('react-polymer must be required before react');
}
//must be called before require('react') is called the first time
DefaultEventPluginOrder.push(keyOf({CustomPlugin: null}));


// See https://github.com/Polymer/polymer/blob/55b91b3db7c3085b31a1d388ac0d9131bedb9f0b/src/standard/x-styling.html#L191
var noNativeShadow = Polymer && !Polymer.Settings.useNativeShadow;
var oldSetValueForAttribute = DOMPropertyOperations.setValueForAttribute;

DOMPropertyOperations.setValueForAttribute = function (node, name, value) {
  if (name !== 'className') return oldSetValueForAttribute(node, name, value);

  node.className = '' + (value || '');
  if (noNativeShadow && !node._scopeCssViaAttr && node._scopeSelector) {
    Polymer.StyleProperties.applyElementScopeSelector(node, node._scopeSelector, null, false);
  }
};

var oldCreateMarkupForCustomAttribute = DOMPropertyOperations.createMarkupForCustomAttribute;

DOMPropertyOperations.createMarkupForCustomAttribute = function (name, value) {
  if (name === 'className') name = 'class';
  return oldCreateMarkupForCustomAttribute(name, value);
};


exports.registerEvent = registerEvent;
exports.registerAttribute = registerAttribute;
