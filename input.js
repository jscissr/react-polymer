/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Based on ReactDomInput.js, react 0.13.3
 */

 /* TODO:
  - iron-selector & paper-radio-group
  - iron-selector multiple
  - gold-* elements
  - paper-dropdown-menu when it's available
*/


'use strict';

var AutoFocusMixin = require('react/lib/AutoFocusMixin');
var DOMPropertyOperations = require('react/lib/DOMPropertyOperations');
var LinkedValueUtils = require('react/lib/LinkedValueUtils');
var ReactClass = require('react/lib/ReactClass');
var ReactElement = require('react/lib/ReactElement');
var ReactMount = require('react/lib/ReactMount');
var ReactUpdates = require('react/lib/ReactUpdates');
//var ReactDefaultBatchingStrategy = require('react/lib/ReactDefaultBatchingStrategy');
var ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter');

var assign = require('react/lib/Object.assign');
//var invariant = require('react/lib/invariant');

var polymerReact = require('./index.js');
polymerReact.registerAttribute('bind-value');
//polymerReact.registerAttribute('value');
polymerReact.registerEvent('change', {onChange: true}, {onChangeCapture: true});
polymerReact.registerEvent('bind-value-changed', {onBindValueChanged: true}, {onBindValueChangedCapture: true});

var instancesByReactID = {};

function forceUpdateIfMounted() {
  /*jshint validthis:true */
  if (this.isMounted()) {
    this.forceUpdate();
  }
}

var baseClass = {
  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin],

  getInitialState: function() {
    var defaultValue = this.props.defaultValue;
    return {
      initialChecked: this.props.defaultChecked || false,
      initialValue: defaultValue != null ? defaultValue : null
    };
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = assign({}, this.props);

    props.defaultChecked = null;
    props.defaultValue = null;

    var value = LinkedValueUtils.getValue(this);
    props.value = value != null ? value : this.state.initialValue;
    if (this._displayName === 'IronAutogrowTextarea') {
      props['bind-value'] = props.value;
      props.value = null;
    }

    var checked = LinkedValueUtils.getChecked(this);
    props.checked = checked != null ? checked : this.state.initialChecked;

    if (this._displayName === 'PaperInput' || this._displayName === 'PaperTextarea' ||
        this._displayName === 'IronAutogrowTextarea') {
      props.onChange = null;
      props.onBindValueChanged = this._handleChange;
    } else {
      props.onChange = this._handleChange;
    }
    /*if (this._displayName === 'PaperSlider') {
      props.onImmediateValueChange = this._handleChange;
    }*/

    return this._elementFactory(props, this.props.children);
  },

  componentDidMount: function() {
    var rootNode = this.getDOMNode();
    var id = ReactMount.getID(rootNode);
    instancesByReactID[id] = this;
  },

  componentWillUnmount: function() {
    var rootNode = this.getDOMNode();
    var id = ReactMount.getID(rootNode);
    delete instancesByReactID[id];
  },

  componentDidUpdate: function(prevProps, prevState, prevContext) {
    var rootNode = this.getDOMNode();
    if (this.props.checked != null) {
      rootNode.checked = !!this.props.checked;
    }

    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      /*if (this._displayName === 'PaperSlider' && rootNode.dragging && +value === +rootNode.value) {
        rootNode._updateKnob(+value); //hack to make it update anyway
      } else {*/
      var previouslyEnabled = ReactBrowserEventEmitter.isEnabled();
      ReactBrowserEventEmitter.setEnabled(false);

      var valueProp = 'value';
      if (this._displayName === 'IronAutogrowTextarea') {
        valueProp = 'bindValue';
      }

      // Cast `value` to a string to ensure the value is set correctly.
      rootNode[valueProp] = '' + value;

      ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
      /*}*/
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      returnValue = onChange.call(this, event);
    }
    // Here we use asap to wait until all updates have propagated, which
    // is important when using controlled components within layers:
    // https://github.com/facebook/react/issues/1698
    ReactUpdates.asap(forceUpdateIfMounted, this);

    return returnValue;
  }

};

var elements = [
  {name: 'paper-input', displayName: 'PaperInput'},
  {name: 'paper-textarea', displayName: 'PaperTextarea'},
  {name: 'iron-autogrow-textarea', displayName: 'IronAutogrowTextarea'},
  {name: 'paper-slider', displayName: 'PaperSlider'},
  {name: 'paper-checkbox', displayName: 'PaperCheckbox'},
  {name: 'paper-toggle-button', displayName: 'PaperToggleButton'},
  {name: 'paper-radio-button', displayName: 'PaperRadioButton'},
];
elements.forEach(function(element) {
  var constructor = assign({}, baseClass);
  constructor.displayName = constructor._displayName = element.displayName;
  constructor._elementFactory = ReactElement.createFactory(element.name);
  module.exports[element.displayName] = ReactClass.createClass(constructor);
});
