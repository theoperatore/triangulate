HD-Canvas
=========

Scales a target `<canvas>` according to the `devicePixelRatio` and `backingStoreData`.

Scaling based off of this [HTML5Rocks article](http://www.html5rocks.com/en/tutorials/canvas/hidpi/).

Install
=======

**via npm:**

```bash
$ npm install hd-canvas
```

**via git to use in a `<script>` tag:**

```bash
$ git clone https://github.com/theoperatore/hdcanvas.git
```

Usage
=====

The target `canvas` is the only required parameter with `width` and `height` parameters optional.

If `width` and `height` aren't specifed, the dimensions of the target canvas are used.

**via node.js:**

Just require the module and hdify!

```javascript
var hdify = require('hd-canvas'),
    cvs = document.createElement('canvas');

// cvs    - target canvas element
// width  - desired width of canvas element
// height - desired height of canvas element
cvs = hdify(cvs, width, height);

document.body.appendChild(cvs);
document.addEventListener('resize', function(ev) {
  
  // resize the canvas to the new dimensions
  cvs = hdify(cvs, newWidth, newHeight);

}, false);
```

[browserify](http://browserify.org/) away and you're ready to roll.

**via browser:**

```html
<script src="./path/to/hdcanvas/browser/hdcanvas.min.js" type="text/javascript"></script>
```

and in javascript:

```javascript
var cvs = document.createElement('canvas');

// cvs    - target canvas element
// width  - desired width of canvas element
// height - desired height of canvas element
cvs = HDCANVAS(cvs, width, height);

document.body.appendChild(cvs);
document.addEventListener('resize', function(ev) {
  
  // resize the canvas to the new dimensions
  cvs = HDCANVAS(cvs, newWidth, newHeight);

}, false);
```
License
=======

MIT
