# react-polymer

*Use Polymer elements in React*

Since [this change](https://github.com/facebook/react/pull/1551) you can put
Polymer elements into React components and at first glance it just works:

```js
<paper-button>click me</paper-button>
```

However, when you then start using custom attributes and events, it doesn't work
anymore.
Now you need react-polymer:

```js
import reactPolymer from 'react-polymer'; //IMPORTANT: Must be imported before React.
import React from 'react';

reactPolymer.registerAttribute('raised');
reactPolymer.registerAttribute('url');
reactPolymer.registerEvent('response', 'onResponse');


<paper-button raised>another button</paper-button>
<iron-ajax url="http://example.com/" onResponse={this.handleResponse} />
```

Also, all the form elements don't work like the native ones.
That's because React internally has wrappers to make controlled components.
We have our own wrapper for the Polymer form elements:

```js
import reactPolymer from 'react-polymer';
import React from 'react';
import {
  PaperInput,
  PaperTextarea,
  IronAutogrowTextarea,
  PaperSlider,
  PaperToggleButton,
  PaperCheckbox,
  PaperRadioButton,
} from 'react-polymer/input';


<PaperInput value={this.state.value} onChange={this.valueChanged} />
<PaperToggleButton checked={this.state.checked} onChange={this.checkedChange} />
```

Another problem is if you set a `className` on a Polymer elements which
dynamically changes.
Polymer adds its own classes for styling, but if you change it in React these
get overwritten.
The solution is to add the `classMixin` to the component and
`ref={this.polymerClass}` to the affected Polymer elements:

```js
import reactPolymer from 'react-polymer';
import React from 'react';

var Component = React.createClass({
  mixins: [reactPolymer.classMixin],

  ...

  <paper-icon className={this.state.answer ? 'yes' : 'no'} ref={this.polymerClass} />

```

## Testing

```shell
npm install
bower install
node demo/build
http-server
```

Now open http://localhost:8080/demo/ in your browser.
There are no automated tests, you have to manually click on the elements and
also verify that you can't change anything if `fields editable` is unchecked.

## Caveats

`paper-slider` works differently from the native `<input type="range">`, it only
fires change events when the user stops dragging.

`iron-selector`, `paper-radio-group` & `gold-*` elements are not yet supported.

Polymer elements can have properties with `notify` attribute, which trigger
`{property}-changed` events. However these events don't bubble, so you have to
manually call `addEventListener` yourself.

This module does a lot of monkey patching, so it only works with React 0.13.
