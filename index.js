'use strict'

var DefaultEventPluginOrder = require('react/lib/DefaultEventPluginOrder')
var DOMPropertyOperations = require('react/lib/DOMPropertyOperations')
var DOMChildrenOperations = require('react/lib/DOMChildrenOperations')
var DOMLazyTree = require('react/lib/DOMLazyTree')
var ReactDOMComponentTree = require('react/lib/ReactDOMComponentTree')
var EventConstants = require('react/lib/EventConstants')
var EventPluginRegistry = require('react/lib/EventPluginRegistry')
var EventPropagators = require('react/lib/EventPropagators')
var ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter')
var ReactInjection = require('react/lib/ReactInjection')
var SyntheticEvent = require('react/lib/SyntheticEvent')
var keyOf = require('fbjs/lib/keyOf')
var Polymer = global.Polymer

function isPolymerElement (element) {
  return element && element.nodeName && element.nodeName.indexOf('-') !== -1
}

var customTopLevelTypes = {}
var ReactPolymerPlugin = {
  eventTypes: {},

  extractEvents: function (
      topLevelType,
      targetInst,
      nativeEvent,
      nativeEventTarget) {
    var targetNode = targetInst && ReactDOMComponentTree.getNodeFromInstance(targetInst)

    if (!customTopLevelTypes.hasOwnProperty(topLevelType) ||
        !isPolymerElement(targetNode)) {
      return null
    }
    var event = SyntheticEvent.getPooled(
      customTopLevelTypes[topLevelType],
      targetInst,
      nativeEvent,
      nativeEventTarget
    )
    EventPropagators.accumulateTwoPhaseDispatches(event)
    return event
  }
}

var registeredEvents = []
var monkeyPatchedExisting = []

/**
 * Register an event to listen for on Polymer elements.
 * @param {string} name the event name (e.g. 'change')
 * @param {object|string} bubbled listener attribute name as an object key (e.g. {onChange: true})
 * @param {object|string} captured capturing listener attribute name as an object key (e.g. {onChangeCapture: true})
 */
function registerEvent (name, bubbled, captured) {
  injectAll()
  if (typeof bubbled !== 'string') {
    bubbled = keyOf(bubbled)
  }
  if (typeof captured !== 'string') {
    captured = captured != null ? keyOf(captured) : bubbled + 'Captured'
  }

  if (registeredEvents.some(function(reg) { return (reg.name === name || reg.bubbled === bubbled) })) {
    return
  }
  registeredEvents.push({name: name, bubbled: bubbled})

  var topLevelType = 'topCustom' + bubbled
  var dispatchConfig = {
    phasedRegistrationNames: {
      bubbled: bubbled,
      captured: captured
    },
    dependencies: [topLevelType]
  }

  var existing = EventPluginRegistry.registrationNameModules[bubbled]
  if (existing) {
    if (monkeyPatchedExisting.indexOf(existing) !== -1) return
    monkeyPatchedExisting.push(existing)

    // monkey-patch over existing function
    var previous = existing.extractEvents

    existing.extractEvents = function (
        localTopLevelType,
        targetInst,
        nativeEvent,
        nativeEventTarget) {
      var targetNode = targetInst && ReactDOMComponentTree.getNodeFromInstance(targetInst)

      if (nativeEvent.type !== name || !isPolymerElement(targetNode)) {
        return previous(localTopLevelType, targetInst, nativeEvent, nativeEventTarget)
      }
      var event = SyntheticEvent.getPooled(
        dispatchConfig,
        targetInst,
        nativeEvent,
        nativeEventTarget
      )
      EventPropagators.accumulateTwoPhaseDispatches(event)
      return event
    }

    return
  }

  EventConstants.topLevelTypes[topLevelType] = topLevelType

  ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
    topLevelType,
    name,
    document
  )

  ReactPolymerPlugin.eventTypes[bubbled] =
      EventPluginRegistry.eventNameDispatchConfigs[bubbled] =
      customTopLevelTypes[topLevelType] = dispatchConfig

  EventPluginRegistry.registrationNameModules[bubbled] =
      EventPluginRegistry.registrationNameModules[captured] = ReactPolymerPlugin

  EventPluginRegistry.registrationNameDependencies[bubbled] =
      EventPluginRegistry.registrationNameDependencies[captured] =
      dispatchConfig.dependencies
}

var attributes = []

/**
 * Register a custom attribute of native elements.
 * @param string name the attribute name
 */
function registerAttribute (name) {
  injectAll()
  if (attributes.indexOf(name) !== -1) {
    return
  }
  attributes.push(name)
}

var isInjected = false
function injectAll () {
  if (isInjected) {
    return
  }
  isInjected = true

  require('react') // make sure it's loaded
  require('react/lib/ReactDOM')
  try {
    ReactInjection.EventPluginHub.injectEventPluginsByName({ReactPolymerPlugin: ReactPolymerPlugin})
  } catch (err) {
    throw new Error('react-polymer must be required before react')
  }

  ReactInjection.DOMProperty.injectDOMPropertyConfig({
    isCustomAttribute: function (name) {
      return attributes.indexOf(name) !== -1
    }
  })
}

// must be called before require('react') is called the first time
DefaultEventPluginOrder.push(keyOf({ReactPolymerPlugin: null}))

var useShadyDOM
if (Polymer && Polymer.Settings) {
  // See https://github.com/Polymer/polymer/blob/55b91b3db7c3085b31a1d388ac0d9131bedb9f0b/src/standard/x-styling.html#L191
  useShadyDOM = !Polymer.Settings.useNativeShadow
} else if (Polymer && Polymer.dom) {
  console.warn('react-polymer: Polymer is not loaded; using Polymer global settings for shady DOM')
  useShadyDOM = (Polymer.dom === 'shady')
} else {
  console.warn('react-polymer: Polymer is not loaded; assuming shady DOM not used')
  useShadyDOM = false
}

var oldSetValueForAttribute = DOMPropertyOperations.setValueForAttribute

DOMPropertyOperations.setValueForAttribute = function (node, name, value) {
  if (value === false) value = null
  if (name !== 'className') return oldSetValueForAttribute(node, name, value)

  node.className = '' + (value || '')
  addPolymerScope(node)
}

var oldDeleteValueForAttribute = DOMPropertyOperations.deleteValueForAttribute

DOMPropertyOperations.deleteValueForAttribute = function (node, name) {
  if (name !== 'className') return oldDeleteValueForAttribute(node, name)

  node.className = ''
  addPolymerScope(node)
}

function addPolymerScope (node) {
  if (useShadyDOM && !node._scopeCssViaAttr && node._scopeSelector) {
    Polymer.StyleProperties.applyElementScopeSelector(node, node._scopeSelector, null, false)
  }
}

var oldCreateMarkupForCustomAttribute = DOMPropertyOperations.createMarkupForCustomAttribute

DOMPropertyOperations.createMarkupForCustomAttribute = function (name, value) {
  if (name === 'className') name = 'class'
  if (value === false) value = null
  return oldCreateMarkupForCustomAttribute(name, value)
}

if (useShadyDOM) {
  var ShadyDOMChildrenOperations = require('./ShadyDOMChildrenOperations')
  DOMChildrenOperations.replaceDelimitedText = ShadyDOMChildrenOperations.replaceDelimitedText
  DOMChildrenOperations.processUpdates = ShadyDOMChildrenOperations.processUpdates

  var ShadyDOMLazyTree = require('./ShadyDOMLazyTree')
  DOMLazyTree.insertTreeBefore = ShadyDOMLazyTree.insertTreeBefore
  DOMLazyTree.replaceChildWithTree = ShadyDOMLazyTree.replaceChildWithTree
  DOMLazyTree.queueChild = ShadyDOMLazyTree.queueChild
  DOMLazyTree.queueHTML = ShadyDOMLazyTree.queueHTML
  DOMLazyTree.queueText = ShadyDOMLazyTree.queueText
}

exports.registerEvent = registerEvent
exports.registerAttribute = registerAttribute
