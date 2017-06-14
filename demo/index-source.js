import reactPolymer from '../'

import React from 'react'
import {render} from 'react-dom'

import {
  IronAutogrowTextarea,
  PaperToggleButton,
  PaperCheckbox,
  PaperInput,
  PaperTextarea,
  PaperSlider,
  PaperListbox,
  PaperRadioGroup,
  PaperTabs,
  IronSelector
} from '../input'

reactPolymer.registerEvent('color-picker-selected', 'onColorPickerSelected')

function App () {
  const c = new React.Component()
  c.state = {
    text: 'Hello world',
    textarea: 'Hello world\nin 2 lines',
    value: 30,
    checked: false,
    editable: true,
    selected: 'small',
    color: ''
  }

  function textChange (event) {
    console.log('textChange, new value: %s', event.target.value)
    if (c.state.editable) {
      c.setState({text: event.target.value})
    }
  }
  function textareaChange (event) {
    console.log('textareaChange, new value: %s', event.target.value)
    if (c.state.editable) {
      c.setState({textarea: event.target.value})
    }
  }
  function valueChange (event) {
    console.log('valueChange, new value: %s', event.target.value)
    if (c.state.editable) {
      c.setState({value: +event.target.value})
    }
  }
  function checkedChange (event) {
    console.log('checkedChange, new value: %s', event.target.checked)
    if (c.state.editable) {
      c.setState({checked: event.target.checked})
    }
  }
  function selectedChange (event) {
    var selected = event.target.selected || event.target.value
    console.log('selectedChange, new value: %s', selected)
    if (c.state.editable) {
      c.setState({selected: selected})
    }
  }

  function editableChange (event) {
    c.setState({editable: event.target.checked})
  }

  function colorChange (event) {
    c.setState({color: event.target.color})
  }

  c.render = () => (
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
            <td><input type='text' value={c.state.text} onChange={textChange} /></td>
            <td><PaperInput label='Label' value={c.state.text} onChange={textChange} /></td>
            <td>
              <iron-input>
                <input value={c.state.text} onChange={textChange} />
              </iron-input>
            </td>
          </tr>
          <tr>
            <td>Textarea</td>
            <td><textarea value={c.state.textarea} onChange={textareaChange} /></td>
            <td><PaperTextarea label='Label' value={c.state.textarea} onChange={textareaChange} /></td>
            <td><IronAutogrowTextarea value={c.state.textarea} onChange={textareaChange} /></td>
          </tr>
          <tr>
            <td>Slider</td>
            <td><input type='range' value={c.state.value} onChange={valueChange} /></td>
            <td><PaperSlider value={c.state.value} onChange={valueChange} /></td>
            <td />
          </tr>
          <tr>
            <td rowSpan='2'>Checkbox</td>
            <td rowSpan='2'><input type='checkbox' checked={c.state.checked} onChange={checkedChange} /></td>
            <td><PaperCheckbox checked={c.state.checked} onChange={checkedChange}>Label</PaperCheckbox></td>
            <td rowSpan='2' />
          </tr>
          <tr>
            <td><PaperToggleButton checked={c.state.checked} onChange={checkedChange} /></td>
          </tr>
          <tr>
            <td>Radio</td>
            <td>
              <label><input type='radio' name='size' value='small' checked={c.state.selected === 'small'} onChange={selectedChange} /> Small</label>
              <label><input type='radio' name='size' value='medium' checked={c.state.selected === 'medium'} onChange={selectedChange} /> Medium</label>
              <label><input type='radio' name='size' value='large' checked={c.state.selected === 'large'} onChange={selectedChange} /> Large</label>
            </td>
            <td>
              <PaperRadioGroup selected={c.state.selected} onChange={selectedChange}>
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
                Size <select value={c.state.selected} onChange={selectedChange}>
                  <option value='small'>Small</option>
                  <option value='medium'>Medium</option>
                  <option value='large'>Large</option>
                </select>
              </label>
            </td>
            <td>
              <paper-dropdown-menu label='Size'>
                <PaperListbox slot='dropdown-content' attr-for-selected='value' selected={c.state.selected} onChange={selectedChange}>
                  <paper-item value='small'>Small</paper-item>
                  <paper-item value='medium'>Medium</paper-item>
                  <paper-item value='large'>Large</paper-item>
                </PaperListbox>
              </paper-dropdown-menu>
            </td>
            <td />
          </tr>
          <tr>
            <td rowSpan='2'>Selector</td>
            <td rowSpan='2' />
            <td>
              <PaperTabs attr-for-selected='value' selected={c.state.selected} onChange={selectedChange}>
                <paper-tab value='small'>Small</paper-tab>
                <paper-tab value='medium'>Medium</paper-tab>
                <paper-tab value='large'>Large</paper-tab>
              </PaperTabs>
            </td>
            <td rowSpan='2'>
              <IronSelector attr-for-selected='name' selected={c.state.selected} onChange={selectedChange}>
                <div name='small'>Small</div>
                <div name='medium'>Medium</div>
                <div name='large'>Large</div>
              </IronSelector>
            </td>
          </tr>
          <tr>
            <td>
              <PaperListbox attr-for-selected='value' selected={c.state.selected} onChange={selectedChange}>
                <paper-item value='small'>Small</paper-item>
                <paper-item value='medium'>Medium</paper-item>
                <paper-item value='large'>Large</paper-item>
              </PaperListbox>
            </td>
          </tr>
        </tbody>
      </table>

      <p><label><input type='checkbox' checked={c.state.editable} onChange={editableChange} /> fields editable</label></p>

      <p>Changing className (should keep styling): <PaperToggleButton className={'c' + Math.floor(Math.random() * 9999) + ' other-class'} /></p>

      <p>Color picker: <paper-swatch-picker onColorPickerSelected={colorChange} />{c.state.color && ` selected: ${c.state.color}`}</p>
    </div>
  )
  return c
}

setTimeout(
  () => render(<App />, document.getElementById('react-main')),
  0
)
