/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

// This file is based on DOMChildrenOperations from react-dom.
// It is modified to use the Polymer.dom API.
// This is necessary if Polymers shady DOM is used.

'use strict'

var DOMLazyTree = require('react-dom/lib/DOMLazyTree')
// var Danger = require('react-dom/lib/Danger')
var ReactDOMComponentTree = require('react-dom/lib/ReactDOMComponentTree')
var ReactInstrumentation = require('react-dom/lib/ReactInstrumentation')

var createMicrosoftUnsafeLocalFunction = require('react-dom/lib/createMicrosoftUnsafeLocalFunction')
var setInnerHTML = require('react-dom/lib/setInnerHTML')
var setTextContent = require('react-dom/lib/setTextContent')

/* global Polymer */

function lightDOM (element) {
  if (element.__isPolymerInstance__) return Polymer.dom(element)
  return element
}

function getNodeAfter (parentNode, node) {
  // Special case for text components, which return [open, close] comments
  // from getHostNode.
  if (Array.isArray(node)) {
    node = node[1]
  }
  return node ? Polymer.dom(node).nextSibling : parentNode.firstChild
}

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
var insertChildAt = createMicrosoftUnsafeLocalFunction(function (parentNode, childNode, referenceNode) {
  // We rely exclusively on `insertBefore(node, null)` instead of also using
  // `appendChild(node)`. (Using `undefined` is not allowed by all browsers so
  // we are careful to use `null`.)
  parentNode.insertBefore(childNode, referenceNode)
})

function insertLazyTreeChildAt (parentNode, childTree, referenceNode) {
  DOMLazyTree.insertTreeBefore(parentNode, childTree, referenceNode)
}

function moveChild (parentNode, childNode, referenceNode) {
  if (Array.isArray(childNode)) {
    moveDelimitedText(parentNode, childNode[0], childNode[1], referenceNode)
  } else {
    insertChildAt(parentNode, childNode, referenceNode)
  }
}

function removeChild (parentNode, childNode) {
  if (Array.isArray(childNode)) {
    var closingComment = childNode[1]
    childNode = childNode[0]
    removeDelimitedText(parentNode, childNode, closingComment)
    parentNode.removeChild(closingComment)
  }
  parentNode.removeChild(childNode)
}

function moveDelimitedText (parentNode, openingComment, closingComment, referenceNode) {
  var node = openingComment
  while (true) {
    var nextNode = node.nextSibling
    insertChildAt(parentNode, node, referenceNode)
    if (node === closingComment) {
      break
    }
    node = nextNode
  }
}

function removeDelimitedText (parentNode, startNode, closingComment) {
  while (true) {
    var node = Polymer.dom(startNode).nextSibling
    if (node === closingComment) {
      // The closing comment is removed by ReactMultiChild.
      break
    } else {
      parentNode.removeChild(node)
    }
  }
}

function replaceDelimitedText (openingComment, closingComment, stringText) {
  var parentNode = lightDOM(Polymer.dom(openingComment).parentNode)
  var nodeAfterComment = openingComment.nextSibling
  if (nodeAfterComment === closingComment) {
    // There are no text nodes between the opening and closing comments; insert
    // a new one if stringText isn't empty.
    if (stringText) {
      insertChildAt(parentNode, document.createTextNode(stringText), nodeAfterComment)
    }
  } else {
    if (stringText) {
      // Set the text content of the first node after the opening comment, and
      // remove all following nodes up until the closing comment.
      setTextContent(nodeAfterComment, stringText)
      removeDelimitedText(parentNode, nodeAfterComment, closingComment)
    } else {
      removeDelimitedText(parentNode, openingComment, closingComment)
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    ReactInstrumentation.debugTool.onHostOperation({
      instanceID: ReactDOMComponentTree.getInstanceFromNode(openingComment)._debugID,
      type: 'replace text',
      payload: stringText
    })
  }
}

/**
 * Operations for updating with DOM children.
 */
var DOMChildrenOperations = {

  // dangerouslyReplaceNodeWithMarkup: dangerouslyReplaceNodeWithMarkup,

  replaceDelimitedText: replaceDelimitedText,

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @internal
   */
  processUpdates: function (parentNode, updates) {
    if (process.env.NODE_ENV !== 'production') {
      var parentNodeDebugID = ReactDOMComponentTree.getInstanceFromNode(parentNode)._debugID
    }

    parentNode = lightDOM(parentNode)
    for (var k = 0; k < updates.length; k++) {
      var update = updates[k]
      switch (update.type) {
        case 'INSERT_MARKUP':
          insertLazyTreeChildAt(parentNode, update.content, getNodeAfter(parentNode, update.afterNode))
          if (process.env.NODE_ENV !== 'production') {
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: parentNodeDebugID,
              type: 'insert child',
              payload: { toIndex: update.toIndex, content: update.content.toString() }
            })
          }
          break
        case 'MOVE_EXISTING':
          moveChild(parentNode, update.fromNode, getNodeAfter(parentNode, update.afterNode))
          if (process.env.NODE_ENV !== 'production') {
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: parentNodeDebugID,
              type: 'move child',
              payload: { fromIndex: update.fromIndex, toIndex: update.toIndex }
            })
          }
          break
        case 'SET_MARKUP':
          setInnerHTML(parentNode, update.content)
          if (process.env.NODE_ENV !== 'production') {
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: parentNodeDebugID,
              type: 'replace children',
              payload: update.content.toString()
            })
          }
          break
        case 'TEXT_CONTENT':
          setTextContent(parentNode, update.content)
          if (process.env.NODE_ENV !== 'production') {
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: parentNodeDebugID,
              type: 'replace text',
              payload: update.content.toString()
            })
          }
          break
        case 'REMOVE_NODE':
          removeChild(parentNode, update.fromNode)
          if (process.env.NODE_ENV !== 'production') {
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: parentNodeDebugID,
              type: 'remove child',
              payload: { fromIndex: update.fromIndex }
            })
          }
          break
      }
    }
  }

}

module.exports = DOMChildrenOperations
