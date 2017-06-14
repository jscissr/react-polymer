var reactPolymer = require('./')
var React = require('react')
var ReactUpdates = require('react-dom/lib/ReactUpdates')
var PropTypes = require('prop-types')
var assign = require('object-assign')

reactPolymer.registerEvent('change', 'onChange')
reactPolymer.registerEvent('immediate-value-change', 'onImmediateValueChange')
reactPolymer.registerEvent('iron-select', 'onIronSelect')

function createToggleClass (PolymerToggle, displayName) {
  function Toggle () {
    const c = new React.Component()
    function onChange (event) {
      if (c.props.onChange) c.props.onChange.call(undefined, event)
      if (c.props.checked != null) event.target.checked = c.props.checked
    }
    const props = {onChange}
    c.render = () => React.createElement(PolymerToggle, assign({}, c.props, props))
    return c
  }
  Toggle.displayName = displayName
  Toggle.propTypes = {
    onChange: PropTypes.func,
    checked: PropTypes.bool
  }
  return Toggle
}

exports.PaperCheckbox = createToggleClass('paper-checkbox', 'PaperCheckbox')
exports.PaperToggleButton = createToggleClass('paper-toggle-button', 'PaperToggleButton')

function createTextClass (PolymerText, displayName) {
  function Text () {
    const c = new React.Component()
    function onChange (event) {
      if (c.props.onChange) c.props.onChange.call(undefined, event)

      var target = event.currentTarget
      ReactUpdates.asap(() => {
        if (c.props.value == null) return
        if (PolymerText === 'iron-autogrow-textarea') {
          target.bindValue = c.props.value
        } else {
          target.value = c.props.value
        }
      })
    }
    var props = {
      onChange: null,
      onInput: onChange
    }
    c.render = () => {
      if (PolymerText === 'iron-autogrow-textarea') {
        props.value = null
        props['bind-value'] = c.props.value
      }
      return React.createElement(PolymerText, assign({}, c.props, props))
    }
    return c
  }
  Text.displayName = displayName
  Text.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string
  }
  return Text
}

exports.IronAutogrowTextarea = createTextClass('iron-autogrow-textarea', 'IronAutogrowTextarea')
exports.PaperInput = createTextClass('paper-input', 'PaperInput')
exports.PaperTextarea = createTextClass('paper-textarea', 'PaperTextarea')

function PaperSlider () {
  const c = new React.Component()
  function onChange (event) {
    var target = event.target
    target.value = target.immediateValue
    if (c.props.onChange) c.props.onChange.call(undefined, event)

    ReactUpdates.asap(() => {
      if (c.props.value != null) target.value = c.props.value
    })
  }
  const props = {onChange, onImmediateValueChange: onChange}
  c.render = () => React.createElement('paper-slider', assign({}, c.props, props))
  return c
}
PaperSlider.displayName = 'PaperSlider'
PaperSlider.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.number
}
exports.PaperSlider = PaperSlider

function createSelectorClass (PolymerSelector, displayName) {
  function Selector () {
    const c = new React.Component()
    function onChange (event) {
      var target = event.target

      if (c.props.onChange && c.props.selected !== target.selected) c.props.onChange.call(undefined, event)
      ReactUpdates.asap(() => {
        if (c.props.selected != null) target.selected = c.props.selected
      })
    }
    const props = {onChange: null, onIronSelect: onChange}
    c.render = () => React.createElement(PolymerSelector, assign({}, c.props, props))
    return c
  }
  Selector.displayName = displayName
  Selector.propTypes = {
    onChange: PropTypes.func,
    selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }
  return Selector
}

exports.PaperListbox = createSelectorClass('paper-listbox', 'PaperListbox')
exports.PaperRadioGroup = createSelectorClass('paper-radio-group', 'PaperRadioGroup')
exports.PaperTabs = createSelectorClass('paper-tabs', 'PaperTabs')
exports.IronSelector = createSelectorClass('iron-selector', 'IronSelector')
