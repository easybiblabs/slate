'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../plugins/core');

var _core2 = _interopRequireDefault(_core);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _schema2 = require('./schema');

var _schema3 = _interopRequireDefault(_schema2);

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:stack');

/**
 * Methods that are triggered on events and can change the state.
 *
 * @type {Array}
 */

var EVENT_HANDLER_METHODS = ['onBeforeInput', 'onBlur', 'onCopy', 'onCut', 'onDrop', 'onKeyDown', 'onPaste', 'onSelect'];

/**
 * Methods that accumulate an updated state.
 *
 * @type {Array}
 */

var STATE_ACCUMULATOR_METHODS = ['onBeforeChange', 'onChange'];

/**
 * Methods that accumulate an array.
 *
 * @type {Array}
 */

var ARRAY_ACCUMULATOR_METHODS = ['render'];

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  plugins: [],
  schema: new _schema3.default()
};

/**
 * Stack.
 *
 * @type {Stack}
 */

var Stack = function (_ref) {
  _inherits(Stack, _ref);

  function Stack() {
    _classCallCheck(this, Stack);

    return _possibleConstructorReturn(this, (Stack.__proto__ || Object.getPrototypeOf(Stack)).apply(this, arguments));
  }

  _createClass(Stack, [{
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'stack';
    }
  }], [{
    key: 'create',


    /**
     * Constructor.
     *
     * @param {Object} properties
     *   @property {Array} plugins
     *   @property {Schema|Object} schema
     *   @property {Function} ...handlers
     */

    value: function create(properties) {
      var plugins = resolvePlugins(properties);
      var schema = resolveSchema(plugins);
      return new Stack({ plugins: plugins, schema: schema });
    }
  }]);

  return Stack;
}(new _immutable.Record(DEFAULTS));

/**
 * Mix in the event handler methods.
 *
 * @param {State} state
 * @param {Editor} editor
 * @param {Mixed} ...args
 * @return {State|Null}
 */

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  var _loop = function _loop() {
    var method = _step.value;

    Stack.prototype[method] = function (state, editor) {
      debug(method);

      if (method == 'onChange') {
        state = this.onBeforeChange(state, editor);
      }

      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.plugins[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var plugin = _step5.value;

          if (!plugin[method]) continue;
          var next = plugin[method].apply(plugin, args.concat([state, editor]));
          if (next == null) continue;
          assertState(next);
          return next;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return state;
    };
  };

  for (var _iterator = EVENT_HANDLER_METHODS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    _loop();
  }

  /**
   * Mix in the state accumulator methods.
   *
   * @param {State} state
   * @param {Editor} editor
   * @param {Mixed} ...args
   * @return {State|Null}
   */
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator.return) {
      _iterator.return();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

var _iteratorNormalCompletion2 = true;
var _didIteratorError2 = false;
var _iteratorError2 = undefined;

try {
  var _loop2 = function _loop2() {
    var method = _step2.value;

    Stack.prototype[method] = function (state, editor) {
      debug(method);

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.plugins[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var plugin = _step6.value;

          if (!plugin[method]) continue;
          var next = plugin[method].apply(plugin, args.concat([state, editor]));
          if (next == null) continue;
          assertState(next);
          state = next;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return state;
    };
  };

  for (var _iterator2 = STATE_ACCUMULATOR_METHODS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
    _loop2();
  }

  /**
   * Mix in the array accumulator methods.
   *
   * @param {State} state
   * @param {Editor} editor
   * @param {Mixed} ...args
   * @return {Array}
   */
} catch (err) {
  _didIteratorError2 = true;
  _iteratorError2 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion2 && _iterator2.return) {
      _iterator2.return();
    }
  } finally {
    if (_didIteratorError2) {
      throw _iteratorError2;
    }
  }
}

var _iteratorNormalCompletion3 = true;
var _didIteratorError3 = false;
var _iteratorError3 = undefined;

try {
  var _loop3 = function _loop3() {
    var method = _step3.value;

    Stack.prototype[method] = function (state, editor) {
      debug(method);
      var array = [];

      for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.plugins[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var plugin = _step7.value;

          if (!plugin[method]) continue;
          var next = plugin[method].apply(plugin, args.concat([state, editor]));
          if (next == null) continue;
          array.push(next);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return array;
    };
  };

  for (var _iterator3 = ARRAY_ACCUMULATOR_METHODS[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
    _loop3();
  }

  /**
   * Assert that a `value` is a state object.
   *
   * @param {Mixed} value
   */
} catch (err) {
  _didIteratorError3 = true;
  _iteratorError3 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion3 && _iterator3.return) {
      _iterator3.return();
    }
  } finally {
    if (_didIteratorError3) {
      throw _iteratorError3;
    }
  }
}

function assertState(value) {
  if (value instanceof _state2.default) return;
  throw new Error('A plugin returned an unexpected state value: ' + value);
}

/**
 * Resolve a schema from a set of `plugins`.
 *
 * @param {Array} plugins
 * @return {Schema}
 */

function resolveSchema(plugins) {
  var rules = [];

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = plugins[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var plugin = _step4.value;

      if (plugin.schema == null) continue;
      var _schema = _schema3.default.create(plugin.schema);
      rules = rules.concat(_schema.rules);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var schema = _schema3.default.create({ rules: rules });
  return schema;
}

/**
 * Resolve an array of plugins from `properties`.
 *
 * In addition to the plugins provided in `properties.plugins`, this will
 * create two other plugins:
 *
 * - A plugin made from the top-level `properties` themselves, which are
 * placed at the beginning of the stack. That way, you can add a `onKeyDown`
 * handler, and it will override all of the existing plugins.
 *
 * - A "core" functionality plugin that handles the most basic events in Slate,
 * like deleting characters, splitting blocks, etc.
 *
 * @param {Object} props
 * @return {Array}
 */

function resolvePlugins(props) {
  var _props$plugins = props.plugins,
      plugins = _props$plugins === undefined ? [] : _props$plugins,
      overridePlugin = _objectWithoutProperties(props, ['plugins']);

  var corePlugin = (0, _core2.default)(props);
  return [overridePlugin].concat(_toConsumableArray(plugins), [corePlugin]);
}

/**
 * Export.
 *
 * @type {Stack}
 */

exports.default = Stack;