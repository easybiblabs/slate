'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _schema = require('../models/schema');

var _schema2 = _interopRequireDefault(_schema);

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Options object with normalize set to `false`.
 *
 * @type {Object}
 */

var OPTS = { normalize: false };

/**
 * Define the core schema rules, order-sensitive.
 *
 * @type {Array}
 */

var rules = [

/**
 * Only allow block nodes in documents.
 *
 * @type {Object}
 */

{
  match: function match(node) {
    return node.kind == 'document';
  },
  validate: function validate(document) {
    var invalids = document.nodes.filter(function (n) {
      return n.kind != 'block';
    });
    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, document, invalids) {
    invalids.forEach(function (node) {
      transform.removeNodeByKey(node.key, OPTS);
    });
  }
},

/**
 * Only allow block, inline and text nodes in blocks.
 *
 * @type {Object}
 */

{
  match: function match(node) {
    return node.kind == 'block';
  },
  validate: function validate(block) {
    var invalids = block.nodes.filter(function (n) {
      return n.kind != 'block' && n.kind != 'inline' && n.kind != 'text';
    });

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, block, invalids) {
    invalids.forEach(function (node) {
      transform.removeNodeByKey(node.key, OPTS);
    });
  }
},

/**
 * Only allow inline and text nodes in inlines.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'inline';
  },
  validate: function validate(inline) {
    var invalids = inline.nodes.filter(function (n) {
      return n.kind != 'inline' && n.kind != 'text';
    });
    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, inline, invalids) {
    invalids.forEach(function (node) {
      transform.removeNodeByKey(node.key, OPTS);
    });
  }
},

/**
 * Ensure that block and inline nodes have at least one text child.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    return node.nodes.size == 0;
  },
  normalize: function normalize(transform, node) {
    var text = _text2.default.create();
    transform.insertNodeByKey(node.key, 0, text, OPTS);
  }
},

/**
 * Ensure that void nodes contain a text node with a single space of text.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return (object.kind == 'inline' || object.kind == 'block') && object.isVoid;
  },
  validate: function validate(node) {
    return node.text !== ' ' || node.nodes.size !== 1;
  },
  normalize: function normalize(transform, node, result) {
    var text = _text2.default.createFromString(' ');
    var index = node.nodes.size;

    transform.insertNodeByKey(node.key, index, text, OPTS);

    node.nodes.forEach(function (child) {
      transform.removeNodeByKey(child.key, OPTS);
    });
  }
},

/**
 * Ensure that inline nodes are never empty.
 *
 * This rule is applied to all blocks, because when they contain an empty
 * inline, we need to remove the inline from that parent block. If `validate`
 * was to be memoized, it should be against the parent node, not the inline
 * themselves.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block';
  },
  validate: function validate(block) {
    var invalids = block.nodes.filter(function (n) {
      return n.kind == 'inline' && n.text == '';
    });
    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, block, invalids) {
    // If all of the block's nodes are invalid, insert an empty text node so
    // that the selection will be preserved when they are all removed.
    if (block.nodes.size == invalids.size) {
      var text = _text2.default.create();
      transform.insertNodeByKey(block.key, 1, text, OPTS);
    }

    invalids.forEach(function (node) {
      transform.removeNodeByKey(node.key, OPTS);
    });
  }
},

/**
 * Ensure that inline void nodes are surrounded by text nodes, by adding extra
 * blank text nodes if necessary.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    var invalids = node.nodes.reduce(function (list, child, index) {
      if (child.kind !== 'inline') return list;

      var prev = index > 0 ? node.nodes.get(index - 1) : null;
      var next = node.nodes.get(index + 1);
      // We don't test if "prev" is inline, since it has already been processed in the loop
      var insertBefore = !prev;
      var insertAfter = !next || next.kind == 'inline';

      if (insertAfter || insertBefore) {
        list = list.push({ insertAfter: insertAfter, insertBefore: insertBefore, index: index });
      }

      return list;
    }, new _immutable.List());

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, block, invalids) {
    // Shift for every text node inserted previously.
    var shift = 0;

    invalids.forEach(function (_ref) {
      var index = _ref.index,
          insertAfter = _ref.insertAfter,
          insertBefore = _ref.insertBefore;

      if (insertBefore) {
        transform.insertNodeByKey(block.key, shift + index, _text2.default.create(), OPTS);
        shift++;
      }

      if (insertAfter) {
        transform.insertNodeByKey(block.key, shift + index + 1, _text2.default.create(), OPTS);
        shift++;
      }
    });
  }
},

/**
 * Join adjacent text nodes.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    var invalids = node.nodes.map(function (child, i) {
      var next = node.nodes.get(i + 1);
      if (child.kind != 'text') return;
      if (!next || next.kind != 'text') return;
      return [child, next];
    }).filter(Boolean);

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, node, pairs) {
    // We reverse the list to handle consecutive joins, since the earlier nodes
    // will always exist after each join.
    pairs.reverse().forEach(function (pair) {
      var _pair = _slicedToArray(pair, 2),
          first = _pair[0],
          second = _pair[1];

      return transform.joinNodeByKey(second.key, first.key, OPTS);
    });
  }
},

/**
 * Prevent extra empty text nodes, except when adjacent to inline void nodes.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    var nodes = node.nodes;

    if (nodes.size <= 1) return;

    var invalids = nodes.filter(function (desc, i) {
      if (desc.kind != 'text') return;
      if (desc.length > 0) return;

      var prev = i > 0 ? nodes.get(i - 1) : null;
      var next = nodes.get(i + 1);

      // If it's the first node, and the next is a void, preserve it.
      if (!prev && next.kind == 'inline') return;

      // It it's the last node, and the previous is an inline, preserve it.
      if (!next && prev.kind == 'inline') return;

      // If it's surrounded by inlines, preserve it.
      if (next && prev && next.kind == 'inline' && prev.kind == 'inline') return;

      // Otherwise, remove it.
      return true;
    });

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, node, invalids) {
    invalids.forEach(function (text) {
      transform.removeNodeByKey(text.key, OPTS);
    });
  }
}];

/**
 * Create the core schema.
 *
 * @type {Schema}
 */

var SCHEMA = _schema2.default.create({ rules: rules });

/**
 * Export.
 *
 * @type {Schema}
 */

exports.default = SCHEMA;