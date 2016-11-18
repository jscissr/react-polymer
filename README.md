# react-polymer [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][npm-url]

[travis-image]: https://img.shields.io/travis/jscissr/react-polymer/master.svg
[travis-url]: https://travis-ci.org/jscissr/react-polymer
[npm-image]: https://img.shields.io/npm/v/react-polymer.svg
[npm-url]: https://npmjs.org/package/react-polymer
[downloads-image]: https://img.shields.io/npm/dm/react-polymer.svg

*Use Polymer elements in React*

Since [this change](https://github.com/facebook/react/pull/1551) you can put
Polymer elements into React components and at first glance it just works:

```js
<paper-button raised>click me</paper-button>
```

However, when you then start using custom attributes and events, it doesn't work
anymore.

Now you need react-polymer:

```js
import reactPolymer from 'react-polymer' // Must be imported before React
import React from 'react'

reactPolymer.registerAttribute('drawer') // Note: this is only needed for custom attributes on standard elements like div
reactPolymer.registerAttribute('main')
reactPolymer.registerEvent('response', 'onResponse')


<paper-drawer-panel>
  <div drawer> Drawer panel... </div>
  <div main> Main panel... </div>
</paper-drawer-panel>
<iron-ajax url="http://example.com/" onResponse={this.handleResponse} />
```

Also, all the form elements don't work like the native ones.
That's because React internally has wrappers to make controlled components.
We have our own wrapper for the Polymer form elements:

```js
import reactPolymer from 'react-polymer'
import React from 'react'
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
} from 'react-polymer/input'


<PaperInput value={this.state.value} onChange={this.valueChanged} />
<PaperToggleButton checked={this.state.checked} onChange={this.checkedChange} />
```

Another problem that is solved automatically by react-polymer is that
`className` doesn't work on Polymer elements.

See [more examples](https://github.com/jscissr/react-polymer/blob/master/demo/index-source.js).

## ES6

This module uses some ES6 features, so you should run it through a transpiler like [babel](https://babeljs.io/). If you use [browserify](http://browserify.org/), you don't need to do anything. If you use [webpack](https://webpack.github.io/), you have to [enable transpiling](https://webpack.github.io/docs/usage.html#transpiling-es2015-using-babel-loader), but replace the default `exclude` config with `exclude: s => /node_modules/.test(s) && !/react-polymer/.test(s)`. (If you know how to make webpack do this automatically like it works with browserify, please tell me!)

## Testing

```shell
npm install
bower install
npm run test-local
```

## Caveats

`gold-*` elements are not yet supported.

Polymer elements can have properties with `notify` attribute, which trigger
`{property}-changed` events. However these events don't bubble, so you have to
manually call `addEventListener` yourself.

This module does a lot of monkey patching on internal APIs of react-dom, so it only works with React 15. It is recommended to pin React to a fixed version, and always test new versions before updating. There is no guarantee that it will still work, even after patch-level updates of React.

## Notes

Some React issues that might simplify this once solved:

- https://github.com/facebook/react/issues/4933
- https://github.com/facebook/react/issues/140
- https://github.com/facebook/react/issues/4751

## Similar Libraries

For mixing Polymer and React, there is [Maple](https://github.com/Wildhoney/Maple.js), which doesn't seem to be maintained anymore. However, if all you are looking for is a way to incorporate pre-built Material Design components into React, there are also [Material-UI](https://github.com/callemall/material-ui) and [React-Materialize](https://github.com/react-materialize/react-materialize).

## License

MIT.
