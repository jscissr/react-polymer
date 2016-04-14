import '../'

import React from 'react'
import {render} from 'react-dom'

import {
  IronAutogrowTextarea,
  PaperToggleButton,
  PaperCheckbox,
  PaperInput,
  PaperTextarea,
  PaperSlider,
  PaperMenu,
  PaperListbox,
  PaperRadioGroup,
  PaperTabs,
  IronSelector
} from '../input'

var App = React.createClass({
  getInitialState () {
    return {
      text: 'Hello world',
      textarea: 'Hello world\nin 2 lines',
      value: 30,
      checked: false,
      editable: true,
      selected: 'small'
    }
  },

  textChange (event) {
    console.log('textChange, new value: %s', event.target.value)
    if (this.state.editable) {
      this.setState({text: event.target.value})
    }
  },
  textareaChange (event) {
    console.log('textareaChange, new value: %s', event.target.value)
    if (this.state.editable) {
      this.setState({textarea: event.target.value})
    }
  },
  valueChange (event) {
    console.log('valueChange, new value: %s', event.target.value)
    if (this.state.editable) {
      this.setState({value: +event.target.value})
    }
  },
  checkedChange (event) {
    console.log('checkedChange, new value: %s', event.target.checked)
    if (this.state.editable) {
      this.setState({checked: event.target.checked})
    }
  },
  selectedChange (event) {
    var selected = event.target.selected || event.target.value
    console.log('selectedChange, new value: %s', selected)
    if (this.state.editable) {
      this.setState({selected: selected})
    }
  },

  editableChange (event) {
    this.setState({editable: event.target.checked})
  },

  render () {
    return (
      <div>
        <h1>react-polymer demo</h1>

        <table>
          <tbody>
            <tr>
              <td />
              <td>Native</td>
              <td>Paper</td>
              <td>Iron</td>
            </tr>
            <tr>
              <td>Text</td>
              <td><input type='text' value={this.state.text} onChange={this.textChange} /></td>
              <td><PaperInput label='Label' value={this.state.text} onChange={this.textChange} /></td>
              <td><input is='iron-input' value={this.state.text} onChange={this.textChange} /></td>
            </tr>
            <tr>
              <td>Textarea</td>
              <td><textarea value={this.state.textarea} onChange={this.textareaChange} /></td>
              <td><PaperTextarea label='Label' value={this.state.textarea} onChange={this.textareaChange} /></td>
              <td><IronAutogrowTextarea value={this.state.textarea} onChange={this.textareaChange} /></td>
            </tr>
            <tr>
              <td>Slider</td>
              <td><input type='range' value={this.state.value} onChange={this.valueChange} /></td>
              <td><PaperSlider value={this.state.value} onChange={this.valueChange} /></td>
              <td />
            </tr>
            <tr>
              <td rowSpan='2'>Checkbox</td>
              <td rowSpan='2'><input type='checkbox' checked={this.state.checked} onChange={this.checkedChange} /></td>
              <td><PaperCheckbox checked={this.state.checked} onChange={this.checkedChange}>Label</PaperCheckbox></td>
              <td rowSpan='2' />
            </tr>
            <tr>
              <td><PaperToggleButton checked={this.state.checked} onChange={this.checkedChange} /></td>
            </tr>
            <tr>
              <td>Radio</td>
              <td>
                <label><input type='radio' name='size' value='small' checked={this.state.selected === 'small'} onChange={this.selectedChange} /> Small</label>
                <label><input type='radio' name='size' value='medium' checked={this.state.selected === 'medium'} onChange={this.selectedChange} /> Medium</label>
                <label><input type='radio' name='size' value='large' checked={this.state.selected === 'large'} onChange={this.selectedChange} /> Large</label>
              </td>
              <td>
                <PaperRadioGroup selected={this.state.selected} onChange={this.selectedChange}>
                  <paper-radio-button name='small'>Small</paper-radio-button>
                  <paper-radio-button name='medium'>Medium</paper-radio-button>
                  <paper-radio-button name='large'>Large</paper-radio-button>
                </PaperRadioGroup>
              </td>
              <td />
            </tr>
            <tr>
              <td>Dropdown</td>
              <td>
                <label>
                  Size <select value={this.state.selected} onChange={this.selectedChange}>
                    <option value='small'>Small</option>
                    <option value='medium'>Medium</option>
                    <option value='large'>Large</option>
                  </select>
                </label>
              </td>
              <td>
                <paper-dropdown-menu label='Size'>
                  <PaperMenu className='dropdown-content' attr-for-selected='value' selected={this.state.selected} onChange={this.selectedChange}>
                    <paper-item value='small'>Small</paper-item>
                    <paper-item value='medium'>Medium</paper-item>
                    <paper-item value='large'>Large</paper-item>
                  </PaperMenu>
                </paper-dropdown-menu>
              </td>
              <td />
            </tr>
            <tr>
              <td rowSpan='2'>Selector</td>
              <td rowSpan='2' />
              <td>
                <PaperTabs attr-for-selected='value' selected={this.state.selected} onChange={this.selectedChange}>
                  <paper-tab value='small'>Small</paper-tab>
                  <paper-tab value='medium'>Medium</paper-tab>
                  <paper-tab value='large'>Large</paper-tab>
                </PaperTabs>
              </td>
              <td rowSpan='2'>
                <IronSelector attr-for-selected='name' selected={this.state.selected} onChange={this.selectedChange}>
                  <div name='small'>Small</div>
                  <div name='medium'>Medium</div>
                  <div name='large'>Large</div>
                </IronSelector>
              </td>
            </tr>
            <tr>
              <td>
                <PaperListbox attr-for-selected='value' selected={this.state.selected} onChange={this.selectedChange}>
                  <paper-item value='small'>Small</paper-item>
                  <paper-item value='medium'>Medium</paper-item>
                  <paper-item value='large'>Large</paper-item>
                </PaperListbox>
              </td>
            </tr>
          </tbody>
        </table>

        <p><label><input type='checkbox' checked={this.state.editable} onChange={this.editableChange} /> fields editable</label></p>

        <p>Changing className (should keep styling): <PaperToggleButton className={'c' + Math.floor(Math.random() * 9999) + ' other-class'} /></p>
      </div>
    )
  }
})

render(<App />, document.getElementById('react-main'))
