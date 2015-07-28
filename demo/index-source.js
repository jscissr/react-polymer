import polymerReact from '../';

import React from 'react';

polymerReact.registerAttribute('is');
polymerReact.registerAttribute('selected');
polymerReact.registerAttribute('attr-for-selected');

import {PaperInput, PaperTextarea, IronAutogrowTextarea, PaperSlider, PaperToggleButton, PaperCheckbox, PaperRadioButton} from '../input';
/*var PaperInput = 'paper-input',
    PaperSlider = 'paper-slider',
    PaperToggleButton = 'paper-toggle-button',
    PaperCheckbox = 'paper-checkbox',
    PaperRadioButton = 'paper-radio-button';*/


var App = React.createClass({
  mixins: [polymerReact.classMixin],
  getInitialState() {
    return {
      text: 'Hello world',
      textarea: 'Hello world\nin 2 lines',
      value: 30,
      checked: false,
      editable: true,
      selected: 'small',
    };
  },

  textChange(event) {
    console.log('textChange, new value: %s', event.target.value);
    if (this.state.editable) {
      this.setState({text: event.target.value});
    }
  },
  textareaChange(event) {
    console.log('textareaChange, new value: %s', event.target.value);
    if (this.state.editable) {
      this.setState({textarea: event.target.value});
    }
  },
  valueChange(event) {
    console.log('valueChange, new value: %s', event.target.value);
    if (this.state.editable) {
      this.setState({value: event.target.value});
    }
  },
  checkedChange(event) {
    console.log('checkedChange, new value: %s', event.target.checked);
    if (this.state.editable) {
      this.setState({checked: event.target.checked});
    }
  },
  selectedChange(event) {
    console.log('selectedChange, new value: %s', event.target.selected);
    if (this.state.editable) {
      this.setState({selected: event.target.selected});
    }
  },

  editableChange(event) {
    this.setState({editable: event.target.checked});
  },

  /*testToggle() {
    this.setState({testChecked: React.findDOMNode(this.refs.test).checked});
  },
  testLimit(val) {
    return (30 < val && val < 50) ? 30 : val;
  },
  testNativeValue() {//console.log('nativeValue');
    this.setState({testValue: this.testLimit(React.findDOMNode(this.refs.nativeSlider).value)});
  },
  testValue() {
    //var node = React.findDOMNode(this.refs.slider);
    this.setState({testValue: this.testLimit(React.findDOMNode(this.refs.slider).immediateValue)});
    //console.log('value immediate: %d value: %d', node.immediateValue, node.value);
  },*/
  render() {
    return (
      <div>
        <h1>react-polymer demo</h1>

        <table>
          <tr>
            <td></td>
            <td>Native</td>
            <td>Paper</td>
            <td>Iron</td>
          </tr>
          <tr>
            <td>Text</td>
            <td><input type="text" value={this.state.text} onChange={this.textChange} /></td>
            <td><PaperInput label="Label" value={this.state.text} onChange={this.textChange} /></td>
            <td><input is="iron-input" value={this.state.text} onChange={this.textChange} /></td>
          </tr>
          <tr>
            <td>Textarea</td>
            <td><textarea value={this.state.textarea} onChange={this.textareaChange} /></td>
            <td><PaperTextarea label="Label" value={this.state.textarea} onChange={this.textareaChange} /></td>
            <td><IronAutogrowTextarea value={this.state.textarea} onChange={this.textareaChange} /></td>
          </tr>
          <tr>
            <td>Slider</td>
            <td><input type="range" value={this.state.value} onChange={this.valueChange} /></td>
            <td><PaperSlider value={this.state.value} onChange={this.valueChange} /></td>
            <td></td>
          </tr>
          <tr>
            <td rowSpan="2">Checkbox</td>
            <td rowSpan="2"><input type="checkbox" checked={this.state.checked} onChange={this.checkedChange} /></td>
            <td><PaperCheckbox checked={this.state.checked} onChange={this.checkedChange}>Label</PaperCheckbox></td>
            <td rowSpan="2"></td>
          </tr>
          <tr>
            <td><PaperToggleButton checked={this.state.checked} onChange={this.checkedChange} /></td>
          </tr>
          <tr>
            <td>Radio</td>
            <td><input type="radio" checked={this.state.checked} onChange={this.checkedChange} /></td>
            <td><PaperRadioButton checked={this.state.checked} onChange={this.checkedChange}>Label</PaperRadioButton></td>
            <td></td>
          </tr>
          <tr>
            <td>Selector</td>
            <td></td>
            <td>
              <paper-radio-group selected={this.state.selected} onChange={this.selectedChange}>
                <paper-radio-button name="small">Small</paper-radio-button>
                <paper-radio-button name="medium">Medium</paper-radio-button>
                <paper-radio-button name="large">Large</paper-radio-button>
              </paper-radio-group>
            </td>
            <td>
              <iron-selector attr-for-selected="name" selected={this.state.selected} onChange={this.selectedChange}>
                <div name="small">Small</div>
                <div name="medium">Medium</div>
                <div name="large">Large</div>
              </iron-selector>
            </td>
          </tr>

        </table>

        <p><label><input type="checkbox" checked={this.state.editable} onChange={this.editableChange} /> fields editable</label></p>

        <p>For testing classMixin (should keep styling): <PaperToggleButton className={'c' + Math.floor(Math.random() * 9999) + ' other-class'} ref={this.polymerClass} /></p>
      </div>
    );
  }
});

React.render(<App />, document.getElementById('react-main'));
