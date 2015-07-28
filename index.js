'use strict';

var CSSCore = require('react/lib/CSSCore.js');
var DefaultEventPluginOrder = require('react/lib/DefaultEventPluginOrder');
var DOMProperty = require('react/lib/DOMProperty');
var EventConstants = require('react/lib/EventConstants');
var EventPluginRegistry = require('react/lib/EventPluginRegistry');
var EventPluginUtils = require('react/lib/EventPluginUtils');
var EventPropagators = require('react/lib/EventPropagators');
var ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter');
var ReactInjection = require('react/lib/ReactInjection');
var SyntheticEvent = require('react/lib/SyntheticEvent');
var findDOMNode = require('react/lib/findDOMNode');
var keyOf = require('react/lib/keyOf');


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
      nativeEvent) {
    if (!customTopLevelTypes.hasOwnProperty(topLevelType) ||
        !isPolymerElement(topLevelTarget)) {
      return null;
    }
    var event = SyntheticEvent.getPooled(
      customTopLevelTypes[topLevelType],
      topLevelTargetID,
      nativeEvent
    );
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  },
};


var registeredEvents = [];

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
    //monkey-patch over existing function
    var previous = existing.extractEvents;

    existing.extractEvents = function(
        localTopLevelType,
        topLevelTarget,
        topLevelTargetID,
        nativeEvent) {
      if (nativeEvent.type !== name || !isPolymerElement(topLevelTarget)) {
        return previous(localTopLevelType, topLevelTarget, topLevelTargetID, nativeEvent);
      }
      var event = SyntheticEvent.getPooled(
        dispatchConfig,
        topLevelTargetID,
        nativeEvent
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
 * Register a custom attribute of Polymer elements.
 * @param {object|string} name the attribute name
 */
function registerAttribute(name) {
  injectAll();
  if (typeof name !== 'string') {
    name = keyOf(name);
  }
  if (attributes.indexOf(name) !== -1) {
    return;
  }
  attributes.push(name);
  if (DOMProperty.hasBooleanValue[name]) {
    DOMProperty.hasBooleanValue[name] = false;
    DOMProperty.hasOverloadedBooleanValue[name] = true;
  }
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
DefaultEventPluginOrder.push('CustomPlugin');


var classMixin = {
  componentWillMount: function() {
    this._polymerClassRefs = [];
  },
  polymerClass: function(element) {
    this._polymerClassRefs.push(element);
  },
  componentDidUpdate: function() {
    if (!global.Polymer) {
      return;
    }
    for (var i = this._polymerClassRefs.length; i--; ) {
      var element = findDOMNode(this._polymerClassRefs[i]);
      if (!element || element._scopeCssViaAttr ||
          CSSCore.hasClass(element, global.Polymer.StyleProperties.XSCOPE_NAME)) {
        return;
      }
      global.Polymer.StyleProperties.applyElementScopeSelector(element,
          element._scopeSelector);
    }
  }
};


exports.registerEvent = registerEvent;
exports.registerAttribute = registerAttribute;
exports.classMixin = classMixin;
