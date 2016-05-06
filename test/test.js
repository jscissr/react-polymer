/* global Event, CustomEvent */

import test from 'tape'
import reactPolymer from '../'
import React from 'react'
import {render} from 'react-dom'
import {
  PaperCheckbox,
  PaperToggleButton,
  PaperInput,
  PaperTextarea,
  IronAutogrowTextarea,
  PaperSlider,
  PaperMenu,
  PaperListbox,
  PaperRadioGroup,
  PaperTabs,
  IronSelector
} from '../input'

reactPolymer.registerEvent('iron-change', {onIronChange: true}, {onIronChangeCapture: true})
reactPolymer.registerEvent('change', {onChange: true})
reactPolymer.registerAttribute('drawer')

function renderContainer (element) {
  var container = document.createElement('div')
  document.body.appendChild(container)
  render(element, container)
  return container.firstChild
}

function immediateRef (func) { // Necessary for firefox
  return ref => setTimeout(() => func(ref), 0)
}

function setImmediate (func) {
  setTimeout(func, 0)
}

test('React renders simple Polymer elements', t => {
  // This should work without react-polymer
  var checkbox = renderContainer(<paper-checkbox noink />)

  t.ok(checkbox)
  t.equal(checkbox.tagName, 'PAPER-CHECKBOX')
  setImmediate(() => {
    t.equal(checkbox.getAttribute('role'), 'checkbox')
    t.equal(checkbox.getAttribute('noink'), 'true')
    t.end()
  })
})

test('React reads & writes custom attributes on Polymer elements', t => {
  // This should work without react-polymer
  t.plan(1)
  t.timeoutAfter(2000)

  renderContainer(
    <paper-progress secondary-progress='40'
      ref={immediateRef(ref => t.equal(ref.secondaryRatio, 40))} />)
})

test('attribute=false means no attribute set', t => {
  // ...instead of the string 'false'.
  t.plan(1)
  t.timeoutAfter(2000)

  var checkbox = renderContainer(<paper-checkbox disabled={false} />)

  setImmediate(() => {
    t.equal(checkbox.disabled, false)
  })
})

test('dynamic attribute=false means no attribute set', t => {
  // ...instead of the string 'false'.
  t.plan(1)
  t.timeoutAfter(2000)

  var Wrapper = React.createClass({
    getInitialState () {
      return {disabled: true}
    },
    componentDidMount () {
      this.setState({disabled: false})
    },
    render () {
      return <paper-checkbox disabled={this.state.disabled} />
    }
  })

  var checkbox = renderContainer(<Wrapper />)

  setImmediate(() => {
    t.equal(checkbox.disabled, false)
  })
})

test('react-polymer adds custom event listeners', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  var ready = false

  var checkbox = renderContainer(<paper-checkbox onIronChange={() => ready && t.pass('iron-change event received')} />)

  setImmediate(() => {
    ready = true // iron-change may be emitted while loading in firefox
    checkbox.checked = true // triggers iron-change
  })
})

test('react-polymer monkey-patches existing event listener plugins', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  var checkbox = renderContainer(<paper-checkbox onChange={() => t.pass('change event received')} />)

  setImmediate(() => {
    checkbox.click() // triggers change
  })
})

test('react-polymer makes React add custom attributes to native elements', t => {
  /* This is necessary for things like:
      <paper-drawer-panel>
        <div drawer> Drawer panel... </div>
        <div main> Main panel... </div>
      </paper-drawer-panel>
  */
  t.plan(1)
  t.timeoutAfter(2000)

  renderContainer(<div drawer ref={ref => t.equal(ref.getAttribute('drawer'), 'true')} />)
})

test('react-polymer adds classes to Polymer elements', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  renderContainer(<paper-checkbox className='blue' ref={immediateRef(ref => t.equal(ref.className, 'blue x-scope paper-checkbox-0'))} />)
})

test('react-polymer keeps Polymer classes when React classes change', t => {
  t.plan(2)
  t.timeoutAfter(2000)

  var checkBox
  var Wrapper = React.createClass({
    getInitialState () {
      return {lamp: 'red'}
    },
    componentDidMount () {
      setImmediate(() => {
        t.equal(checkBox.className, 'red x-scope paper-checkbox-0')

        this.setState({lamp: 'green'})
        setImmediate(() => {
          t.equal(checkBox.className, 'green x-scope paper-checkbox-0')
        })
      })
    },
    render () {
      return <paper-checkbox className={this.state.lamp} ref={ref => (checkBox = ref)} />
    }
  })
  renderContainer(<Wrapper />)
})

test('use Polymer.dom API for initial subtree render', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  var menu = renderContainer(
    <paper-menu>
      <paper-item />
    </paper-menu>
  )

  setImmediate(() => {
    var checkbox = menu.querySelector('div > paper-item')
    t.ok(checkbox)
  })
})

test('use Polymer.dom API for element insertion', t => {
  t.plan(2)
  t.timeoutAfter(2000)

  var instance

  var Wrapper = React.createClass({
    getInitialState () {
      return {hasChild: false}
    },
    render () {
      instance = this
      return (
        <paper-radio-group>
          {this.state.hasChild && <paper-checkbox />}
        </paper-radio-group>
      )
    }
  })

  var selector = renderContainer(<Wrapper />)

  setImmediate(() => {
    instance.setState({hasChild: true})
    setImmediate(() => {
      var checkbox = selector.querySelector('paper-checkbox')
      t.ok(checkbox)
      checkbox.fire('down')
      setImmediate(() => {
        t.ok(selector.querySelector('paper-checkbox'))
      })
    })
  })
})

test('Polymer.dom API is used for initial textContent', t => {
  t.plan(2)
  t.timeoutAfter(2000)

  var menu = renderContainer(<paper-menu>hello</paper-menu>)

  setImmediate(() => {
    t.ok(menu.querySelector('div'))
    t.ok(menu.querySelector('div').textContent.indexOf('hello') !== -1)
  })
})

test('Polymer.dom API is used for textContent updates', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  var instance

  var Wrapper = React.createClass({
    getInitialState () {
      return {hasChild: false}
    },
    render () {
      instance = this
      return <paper-tab>{this.state.hasChild && 'hello'}</paper-tab>
    }
  })

  var tab = renderContainer(<Wrapper />)

  setImmediate(() => {
    instance.setState({hasChild: true})
    tab.distributeContent()
    setImmediate(() => {
      t.ok(tab.firstElementChild.textContent.indexOf('hello') !== -1)
    })
  })
})

test('Polymer.dom API is used for initial innerHTML', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  var menu = renderContainer(<paper-menu dangerouslySetInnerHTML={{__html: '<br>'}} />)

  setImmediate(() => {
    t.ok(menu.querySelector('div > br'))
  })
})

test('Polymer.dom API is used for innerHTML updates', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  var instance

  var Wrapper = React.createClass({
    getInitialState () {
      return {html: undefined}
    },
    render () {
      instance = this
      return <paper-menu dangerouslySetInnerHTML={this.state.html && {__html: '<br>'}} />
    }
  })

  var menu = renderContainer(<Wrapper />)

  setImmediate(() => {
    instance.setState({html: true})
    setImmediate(() => {
      t.ok(menu.querySelector('div > br'))
    })
  })
})

test('Polymer.dom API is used for moving elements', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  var instance
  var childs = [<span key='a' />, <paper-item key='b' />]

  var Wrapper = React.createClass({
    getInitialState () {
      return {swap: false}
    },
    render () {
      instance = this
      return (
        <paper-menu>
          {childs}
        </paper-menu>
      )
    }
  })

  var menu = renderContainer(<Wrapper />)

  setImmediate(() => {
    childs.push(childs.shift())
    instance.setState({swap: true})
    setImmediate(() => {
      t.ok(menu.querySelector('div > paper-item + span'))
    })
  })
})

test('Polymer.dom API is used for initial multiple textContent', t => {
  t.plan(2)
  t.timeoutAfter(2000)

  var menu = renderContainer(<paper-menu>hello{'world'}</paper-menu>)

  setImmediate(() => {
    t.ok(menu.querySelector('div'))
    t.ok(menu.querySelector('div').textContent.indexOf('helloworld') !== -1)
  })
})

test('Polymer.dom API is used for multiple textContent add/remove/update', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  var instance

  var Wrapper = React.createClass({
    getInitialState () {
      return {first: '', second: 'foo', third: 'bar'}
    },
    render () {
      instance = this
      return <paper-tab>{this.state.first}{this.state.second}{this.state.third}</paper-tab>
    }
  })

  var tab = renderContainer(<Wrapper />)

  setImmediate(() => {
    instance.setState({first: 'hello', second: '', third: 'world'})
    tab.distributeContent()
    setImmediate(() => {
      t.ok(tab.firstElementChild.textContent.indexOf('helloworld') !== -1)
    })
  })
})

test('Polymer.dom API is used for switching child type', t => {
  t.plan(1)
  t.timeoutAfter(2000)

  var instance

  var Wrapper = React.createClass({
    getInitialState () {
      return {content: <br />}
    },
    render () {
      instance = this
      return this.state.content
    }
  })

  var tab = renderContainer(<paper-tab><Wrapper /></paper-tab>)

  setImmediate(() => {
    instance.setState({content: <span>bar</span>})
    tab.distributeContent()
    setImmediate(() => {
      t.ok(tab.querySelector('div > span'))
    })
  })
})

test('Polymer.dom API is used for removing non-root elements', t => {
  // Meaning that the Polymer component has a wrapper arround <content />.
  t.plan(1)
  t.timeoutAfter(2000)

  var instance

  var Wrapper = React.createClass({
    getInitialState () {
      return {hasChild: true}
    },
    render () {
      instance = this
      return <paper-tab>{this.state.hasChild && <div className='something' />}</paper-tab>
    }
  })

  var tab = renderContainer(<Wrapper />)

  setImmediate(() => {
    instance.setState({hasChild: false})
    tab.distributeContent()
    setImmediate(() => {
      t.notOk(tab.querySelector('.something'))
    })
  })
})

// ### Polymer input wrapper ###

function generalInputTest ({name, element, valueProp, valueBefore, valueAfter, interact}) {
  test(`${name} is a controlled component`, t => {
    t.plan(1)
    t.timeoutAfter(2000)

    var input = renderContainer(React.cloneElement(element, {[valueProp]: valueBefore, onChange: () => {}}))

    setImmediate(() => {
      interact(input)
      setImmediate(() => {
        t.equal(input[valueProp], valueBefore)
      })
    })
  })

  test(`${name} updates correctly`, t => {
    t.plan(2)
    t.timeoutAfter(2000)

    var ready = false

    var Wrapper = React.createClass({
      getInitialState () {
        return {value: valueBefore}
      },
      handleChange (event) {
        if (!ready) return
        t.equal(event.target[valueProp], valueAfter, 'in event')
        this.setState({value: event.target[valueProp]})
      },
      render () {
        return React.cloneElement(element, {[valueProp]: this.state.value, onChange: this.handleChange})
      }
    })

    var input = renderContainer(<Wrapper />)

    setImmediate(() => {
      ready = true
      interact(input)
      setImmediate(() => {
        t.equal(input[valueProp], valueAfter)
      })
    })
  })

  test(`${name} is not a controlled component without ${valueProp} prop`, t => {
    t.plan(1)
    t.timeoutAfter(2000)

    var input = renderContainer(React.cloneElement(element))

    setImmediate(() => {
      interact(input)
      setImmediate(() => {
        t.equal(input[valueProp], valueAfter)
      })
    })
  })
}

// toggle

function testToggle (name, Checkbox) {
  generalInputTest({
    name,
    element: <Checkbox />,
    valueProp: 'checked',
    valueBefore: false,
    valueAfter: true,
    interact: checkbox => checkbox.click()
  })
}

testToggle('PaperCheckbox', PaperCheckbox)
testToggle('PaperToggleButton', PaperToggleButton)

// text

function testText (name, Text, nativeName) {
  generalInputTest({
    name,
    element: <Text />,
    valueProp: 'value',
    valueBefore: 'Hello',
    valueAfter: 'Hello world!',
    interact: text => {
      var nativeText = text.querySelector(nativeName)
      nativeText.value = 'Hello world!'
      nativeText.dispatchEvent(new Event('input', {bubbles: true}))
      // no change event, update should happen on every keystroke
    }
  })

  test(`${name} wrapper supports value`, t => {
    t.plan(2)
    t.timeoutAfter(2000)

    var text = renderContainer(<Text value='Hello world!' />)

    setImmediate(() => {
      var nativeText = text.querySelector(nativeName)
      t.ok(nativeText)
      t.equal(nativeText.value, 'Hello world!')
    })
  })
}

testText('PaperInput', PaperInput, 'input')
testText('PaperTextarea', PaperTextarea, 'textarea')
testText('IronAutogrowTextarea', IronAutogrowTextarea, 'textarea')

// slider

generalInputTest({
  name: 'PaperSlider',
  element: <PaperSlider />,
  valueProp: 'value',
  valueBefore: 20,
  valueAfter: 100,
  interact: slider => {
    var sliderKnob = slider.querySelector('#sliderKnob')
    sliderKnob.dispatchEvent(new CustomEvent('track', {detail: {state: 'track', dx: 1000}}))
  }
})

// selector

function testSelector (name, Selector, Item) {
  generalInputTest({
    name,
    element: (
      <Selector attr-for-selected='value'>
        <Item value='small'>Small</Item>
        <Item value='medium'>Medium</Item>
      </Selector>
    ),
    valueProp: 'selected',
    valueBefore: 'medium',
    valueAfter: 'small',
    interact: selector => selector.querySelector(Item).click()
  })
}

testSelector('PaperMenu', PaperMenu, 'paper-item')
testSelector('PaperListbox', PaperListbox, 'paper-item')
testSelector('PaperRadioGroup', PaperRadioGroup, 'paper-radio-button')
testSelector('PaperTabs', PaperTabs, 'paper-tab')
testSelector('IronSelector', IronSelector, 'div')
