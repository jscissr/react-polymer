/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

// This file is based on DOMLazyTree from react-dom.
// It is modified to use the Polymer.dom API.
// This is necessary if Polymers shady DOM is used.

'use strict'

var DOMNamespaces = require('react-dom/lib/DOMNamespaces')
var setInnerHTML = require('react-dom/lib/setInnerHTML')

var createMicrosoftUnsafeLocalFunction = require('react-dom/lib/createMicrosoftUnsafeLocalFunction')
var setTextContent = require('react-dom/lib/setTextContent')

var ELEMENT_NODE_TYPE = 1
var DOCUMENT_FRAGMENT_NODE_TYPE = 11

/* global Polymer */

function lightDOM (element) {
  if (element.__isPolymerInstance__) return Polymer.dom(element)
  return element
}

/**
 * In IE (8-11) and Edge, appending nodes with no children is dramatically
 * faster than appending a full subtree, so we essentially queue up the
 * .appendChild calls here and apply them so each node is added to its parent
 * before any children are added.
 *
 * In other browsers, doing so is slower or neutral compared to the other order
 * (in Firefox, twice as slow) so we only do this inversion in IE.
 *
 * See https://github.com/spicyj/innerhtml-vs-createelement-vs-clonenode.
 */
var enableLazy = typeof document !== 'undefined' && typeof document.documentMode === 'number' || typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string' && /\bEdge\/\d/.test(navigator.userAgent)

function insertTreeChildren (tree) {
  if (!enableLazy) {
    return
  }
  var node = tree.node
  var children = tree.children
  if (children.length) {
    for (var i = 0; i < children.length; i++) {
      insertTreeBefore(node, children[i], null)
    }
  } else if (tree.html != null) {
    setInnerHTML(lightDOM(node), tree.html)
  } else if (tree.text != null) {
    setTextContent(lightDOM(node), tree.text)
  }
}

var insertTreeBefore = createMicrosoftUnsafeLocalFunction(function (parentNode, tree, referenceNode) {
  parentNode = lightDOM(parentNode)
  // DocumentFragments aren't actually part of the DOM after insertion so
  // appending children won't update the DOM. We need to ensure the fragment
  // is properly populated first, breaking out of our lazy approach for just
  // this level. Also, some <object> plugins (like Flash Player) will read
  // <param> nodes immediately upon insertion into the DOM, so <object>
  // must also be populated prior to insertion into the DOM.
  if (tree.node.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE || tree.node.nodeType === ELEMENT_NODE_TYPE && tree.node.nodeName.toLowerCase() === 'object' && (tree.node.namespaceURI == null || tree.node.namespaceURI === DOMNamespaces.html)) {
    insertTreeChildren(tree)
    parentNode.insertBefore(tree.node, referenceNode)
  } else {
    parentNode.insertBefore(tree.node, referenceNode)
    insertTreeChildren(tree)
  }
})

function replaceChildWithTree (oldNode, newTree) {
  lightDOM(Polymer.dom(oldNode).parentNode).replaceChild(newTree.node, oldNode)
  insertTreeChildren(newTree)
}

function queueChild (parentTree, childTree) {
  if (enableLazy) {
    parentTree.children.push(childTree)
  } else {
    lightDOM(parentTree.node).insertBefore(childTree.node, null)
  }
}

function queueHTML (tree, html) {
  if (enableLazy) {
    tree.html = html
  } else {
    setInnerHTML(lightDOM(tree.node), html)
  }
}

function queueText (tree, text) {
  if (enableLazy) {
    tree.text = text
  } else {
    setTextContent(lightDOM(tree.node), text)
  }
}

function toString () {
  return this.node.nodeName
}

function DOMLazyTree (node) {
  return {
    node: node,
    children: [],
    html: null,
    text: null,
    toString: toString
  }
}

DOMLazyTree.insertTreeBefore = insertTreeBefore
DOMLazyTree.replaceChildWithTree = replaceChildWithTree
DOMLazyTree.queueChild = queueChild
DOMLazyTree.queueHTML = queueHTML
DOMLazyTree.queueText = queueText

module.exports = DOMLazyTree
