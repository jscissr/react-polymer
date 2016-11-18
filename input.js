var reactPolymer = require('./')
var React = require('react')
var ReactUpdates = require('react-dom/lib/ReactUpdates')
var assign = require('object-assign')

reactPolymer.registerEvent('change', {onChange: true}, {onChangeCapture: true})
reactPolymer.registerEvent('bind-value-changed', {onBindValueChanged: true}, {onBindValueChangedCapture: true})
reactPolymer.registerEvent('immediate-value-change', {onImmediateValueChange: true}, {onImmediateValueChangeCapture: true})
reactPolymer.registerEvent('iron-select', {onIronSelect: true}, {onIronSelectCapture: true})

function createToggleClass (PolymerToggle, displayName) {
  return React.createClass({
    displayName,
    propTypes: {
      onChange: React.PropTypes.func,
      checked: React.PropTypes.bool
    },
    _onChange (event) {
      if (this.props.onChange) this.props.onChange.call(undefined, event)
      if (this.props.checked != null) event.target.checked = this.props.checked
    },
    render () {
      return React.createElement(PolymerToggle, assign({}, this.props, {onChange: this._onChange}))
    }
  })
}

exports.PaperCheckbox = createToggleClass('paper-checkbox', 'PaperCheckbox')
exports.PaperToggleButton = createToggleClass('paper-toggle-button', 'PaperToggleButton')

function createTextClass (PolymerText, displayName) {
  return React.createClass({
    displayName,
    propTypes: {
      onChange: React.PropTypes.func,
      value: React.PropTypes.string
    },
    _onChange (event) {
      if (this.props.onChange) this.props.onChange.call(undefined, event)

      var target = event.currentTarget
      ReactUpdates.asap(() => {
        if (this.props.value == null) return
        if (PolymerText === 'iron-autogrow-textarea') {
          target.bindValue = this.props.value
        } else {
          target.value = this.props.value
        }
      })
    },
    render () {
      var props = {
        onChange: null,
        onBindValueChanged: this._onChange
      }
      if (PolymerText === 'iron-autogrow-textarea') {
        props.value = null
        props['bind-value'] = this.props.value
      }
      return React.createElement(PolymerText, assign({}, this.props, props))
    }
  })
}

exports.IronAutogrowTextarea = createTextClass('iron-autogrow-textarea', 'IronAutogrowTextarea')
exports.PaperInput = createTextClass('paper-input', 'PaperInput')
exports.PaperTextarea = createTextClass('paper-textarea', 'PaperTextarea')

exports.PaperSlider = React.createClass({
  displayName: 'PaperSlider',
  propTypes: {
    onChange: React.PropTypes.func,
    value: React.PropTypes.number
  },
  _onChange (event) {
    var target = event.target
    target.value = target.immediateValue
    if (this.props.onChange) this.props.onChange.call(undefined, event)

    ReactUpdates.asap(() => {
      if (this.props.value != null) target.value = this.props.value
    })
  },
  render () {
    return React.createElement('paper-slider', assign({}, this.props, {
      onChange: this._onChange,
      onImmediateValueChange: this._onChange
    }))
  }
})

function createSelectorClass (PolymerSelector, displayName) {
  return React.createClass({
    displayName,
    propTypes: {
      onChange: React.PropTypes.func,
      selected: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number])
    },
    _onChange (event) {
      if (this.props.onChange) this.props.onChange.call(undefined, event)

      var target = event.target
      ReactUpdates.asap(() => {
        if (this.props.selected != null) target.selected = this.props.selected
      })
    },
    render () {
      return React.createElement(PolymerSelector, assign({}, this.props, {onChange: null, onIronSelect: this._onChange}))
    }
  })
}

exports.PaperMenu = createSelectorClass('paper-menu', 'PaperMenu')
exports.PaperListbox = createSelectorClass('paper-listbox', 'PaperListbox')
exports.PaperRadioGroup = createSelectorClass('paper-radio-group', 'PaperRadioGroup')
exports.PaperTabs = createSelectorClass('paper-tabs', 'PaperTabs')
exports.IronSelector = createSelectorClass('iron-selector', 'IronSelector')
