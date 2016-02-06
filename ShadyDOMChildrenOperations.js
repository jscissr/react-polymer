/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DOMChildrenOperations
 * @typechecks static-only
 */

// This file is based on DOMChildrenOperations from React.
// It is modified to use the Polymer.dom API.
// This is necessary if Polymers shady DOM is used.

'use strict'

var Danger = require('react/lib/Danger')
var ReactMultiChildUpdateTypes = require('react/lib/ReactMultiChildUpdateTypes')

var setInnerHTML = require('react/lib/setInnerHTML')
var setTextContent = require('react/lib/setTextContent')
var invariant = require('fbjs/lib/invariant')

/* global Polymer */

function lightDOM (element) {
  if (element.__isPolymerInstance__) return Polymer.dom(element)
  return element
}

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
function insertChildAt (parentNode, childNode, index) {
  // By exploiting arrays returning `undefined` for an undefined index, we can
  // rely exclusively on `insertBefore(node, null)` instead of also using
  // `appendChild(node)`. However, using `undefined` is not allowed by all
  // browsers so we must replace it with `null`.

  // fix render order error in safari
  // IE8 will throw error when index out of list size.
  var beforeChild = index >= parentNode.childNodes.length ? null : parentNode.childNodes[index]

  parentNode.insertBefore(childNode, beforeChild)
}

/**
 * Operations for updating with DOM children.
 */
var DOMChildrenOperations = {

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markupList List of markup strings.
   * @internal
   */
  processUpdates: function (updates, markupList) {
    var update
    // Mapping from parent IDs to initial child orderings.
    var initialChildren = null
    // List of children that will be moved or removed.
    var updatedChildren = null

    for (var i = 0; i < updates.length; i++) {
      update = updates[i]
      if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING || update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
        var updatedIndex = update.fromIndex
        var updatedChild = lightDOM(update.parentNode).childNodes[updatedIndex]
        var parentID = update.parentID

        !updatedChild ? process.env.NODE_ENV !== 'production' ? invariant(false, 'processUpdates(): Unable to find child %s of element. This ' + 'probably means the DOM was unexpectedly mutated (e.g., by the ' + 'browser), usually due to forgetting a <tbody> when using tables, ' + 'nesting tags like <form>, <p>, or <a>, or using non-SVG elements ' + 'in an <svg> parent. Try inspecting the child nodes of the element ' + 'with React ID `%s`.', updatedIndex, parentID) : invariant(false) : undefined

        initialChildren = initialChildren || {}
        initialChildren[parentID] = initialChildren[parentID] || []
        initialChildren[parentID][updatedIndex] = updatedChild

        updatedChildren = updatedChildren || []
        updatedChildren.push(updatedChild)
      }
    }

    var renderedMarkup
    // markupList is either a list of markup or just a list of elements
    if (markupList.length && typeof markupList[0] === 'string') {
      renderedMarkup = Danger.dangerouslyRenderMarkup(markupList)
    } else {
      renderedMarkup = markupList
    }

    // Remove updated children first so that `toIndex` is consistent.
    if (updatedChildren) {
      for (var j = 0; j < updatedChildren.length; j++) {
        // The child must be wrapped in Polymer.dom even if it is not a Polymer element
        lightDOM(Polymer.dom(updatedChildren[j]).parentNode).removeChild(updatedChildren[j])
      }
    }

    for (var k = 0; k < updates.length; k++) {
      update = updates[k]
      var parentNode = lightDOM(update.parentNode)
      switch (update.type) {
        case ReactMultiChildUpdateTypes.INSERT_MARKUP:
          insertChildAt(parentNode, renderedMarkup[update.markupIndex], update.toIndex)
          break
        case ReactMultiChildUpdateTypes.MOVE_EXISTING:
          insertChildAt(parentNode, initialChildren[update.parentID][update.fromIndex], update.toIndex)
          break
        case ReactMultiChildUpdateTypes.SET_MARKUP:
          setInnerHTML(parentNode, update.content)
          break
        case ReactMultiChildUpdateTypes.TEXT_CONTENT:
          setTextContent(parentNode, update.content)
          break
        case ReactMultiChildUpdateTypes.REMOVE_NODE:
          // Already removed by the for-loop above.
          break
      }
    }
  }

}

module.exports = DOMChildrenOperations
