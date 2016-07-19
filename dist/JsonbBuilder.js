'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JsonbQuery = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lutilsTypeof = require('lutils-typeof');

var _lutilsTypeof2 = _interopRequireDefault(_lutilsTypeof);

var _transposer = require('transposer');

var _transposer2 = _interopRequireDefault(_transposer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var transpose = _transposer2.default.prototype.transpose;

var JsonbBuilder = function () {
    function JsonbBuilder() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, JsonbBuilder);

        this.column = config.column || '';
    }

    /**
     *  Builds an array of jsonb query objects
     *
     *  @param    {Object}  config
     *  @return   {Array of JsonbQuery}
     */


    _createClass(JsonbBuilder, [{
        key: 'build',
        value: function build(input, search) {
            var inputType = (0, _lutilsTypeof2.default)(input);

            var paramTree = input;
            var queries = [];

            if (inputType === 'string') paramTree = _defineProperty({}, input, search);else if (inputType === 'array') paramTree = input.reduce(function (obj, val) {
                return _extends({}, obj, val);
            }, {});

            for (var key in paramTree) {
                // Casts the key into a proper tree if necessary
                var pointer = transpose(key, paramTree[key]);
                var query = new JsonbQuery({ column: this.column }).parse(pointer);

                queries.push(query);
            }

            return inputType === 'string' ? queries[0] : queries;
        }
    }, {
        key: 'get',
        value: function get(input, search, options) {
            if (!_lutilsTypeof2.default.String(input)) {
                options = search;
                search = null;
            }

            var queries = this.build(input, search);

            switch ((0, _lutilsTypeof2.default)(input)) {
                case 'string':
                    return queries.get(options)[0];

                default:
                    return queries.map(function (query) {
                        return query.get(options);
                    });
            }
        }
    }, {
        key: 'selector',
        value: function selector(input, search, options) {
            if (!_lutilsTypeof2.default.String(input)) {
                options = search;
                search = null;
            }
            options = options || {};
            options.asSelector = true;

            return this.get(input, search, options);
        }
    }]);

    return JsonbBuilder;
}();

exports.default = JsonbBuilder;

var JsonbQuery = exports.JsonbQuery = function () {
    function JsonbQuery() {
        var _this = this;

        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var column = _ref.column;

        _classCallCheck(this, JsonbQuery);

        this.comparators = {
            $eq: function $eq(value) {
                return _this._compare({ value: value, operator: '=' });
            },
            $ne: function $ne(value) {
                return _this._compare({ value: value, operator: '!=' });
            },

            $like: function $like(value) {
                return _this._compare({ value: value, type: 'string', operator: 'LIKE' });
            },
            $notLike: function $notLike(value) {
                return _this._compare({ value: value, type: 'string', operator: 'NOT LIKE' });
            },

            $iLike: function $iLike(value) {
                return _this._compare({ value: value, type: 'string', operator: 'ILIKE' });
            },
            $notILike: function $notILike(value) {
                return _this._compare({ value: value, type: 'string', operator: 'NOT ILIKE' });
            },

            $gt: function $gt(value) {
                return _this._compare({ value: value, operator: '>' });
            },
            $gte: function $gte(value) {
                return _this._compare({ value: value, operator: '>=' });
            },

            $lt: function $lt(value) {
                return _this._compare({ value: value, operator: '<' });
            },
            $lte: function $lte(value) {
                return _this._compare({ value: value, operator: '<=' });
            },

            $between: function $between(value) {
                return _this._compare({ value: value, operator: 'BETWEEN' });
            },
            $notBetween: function $notBetween(value) {
                return _this._compare({ value: value, operator: 'NOT BETWEEN' });
            },

            $not: function $not(value) {
                return _this._compare({ value: value, operator: 'IS NOT' });
            },

            $in: function $in(value) {
                return _this._compare({ value: value, operator: 'IN' });
            },
            $notIn: function $notIn(value) {
                return _this._compare({ value: value, operator: 'IN' });
            },

            $ovalueerlap: function $ovalueerlap(value) {
                return _this._compare({ value: value, operator: '&&' });
            },
            $contains: function $contains(value) {
                return _this._compare({ value: value, operator: '@>' });
            },
            $contained: function $contained(value) {
                return _this._compare({ value: value, operator: '<@' });
            },

            $any: function $any(value) {
                return _this._compare({ value: value, operator: 'ANY' });
            }
        };
        this.types = {
            'number': '::int'
        };

        this.column = column || '';
    }

    _createClass(JsonbQuery, [{
        key: 'parse',
        value: function parse(tree) {
            var _parseTree2 = this._parseTree(tree);

            var keys = _parseTree2.keys;
            var search = _parseTree2.search;


            this.keys = keys;
            this.search = search;

            return this;
        }
    }, {
        key: 'get',
        value: function get() {
            var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var _ref2$asSelector = _ref2.asSelector;
            var asSelector = _ref2$asSelector === undefined ? false : _ref2$asSelector;
            var _ref2$search = _ref2.search;
            var search = _ref2$search === undefined ? this.search : _ref2$search;

            return this.buildQuery([].concat(_toConsumableArray(this.keys)), asSelector ? null : search);
        }
    }, {
        key: 'selector',
        value: function selector() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            options.asSelector = true;
            return this.get(options);
        }
    }, {
        key: 'buildQuery',
        value: function buildQuery(keys, search) {
            var items = [];

            if (this.column) keys.unshift(this.column);

            var lastIndex = keys.length - 1;
            var parts = keys.map(function (key, index) {
                // Ensures the first joiner is ignored, and the last is ->>
                var joiner = index === 0 ? '' : index === lastIndex ? ' ->> ' : ' -> ';

                return [joiner, key].join('');
            });

            if (search) {
                for (var key in search) {
                    var value = search[key];
                    var comparitor = this.comparators[key];

                    items.push('( ' + parts.join('') + ' )' + comparitor(value));
                }
            } else {
                items.push('( ' + parts.join('') + ' )');
            }

            return items;
        }
    }, {
        key: '_compare',
        value: function _compare() {
            var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var value = _ref3.value;
            var _ref3$type = _ref3.type;
            var type = _ref3$type === undefined ? (0, _lutilsTypeof2.default)(value) : _ref3$type;
            var _ref3$operator = _ref3.operator;
            var operator = _ref3$operator === undefined ? '=' : _ref3$operator;

            if (type !== 'number') value = '\'' + value + '\'';

            return (this.types[type] || '') + ' ' + operator + ' ' + value;
        }
    }, {
        key: '_isSearch',
        value: function _isSearch(obj) {
            var _this2 = this;

            return Object.keys(obj).some(function (key) {
                return key in _this2.comparators;
            });
        }
    }, {
        key: '_parseTree',
        value: function _parseTree(pointer) {
            var keys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            var type = (0, _lutilsTypeof2.default)(pointer);

            for (var key in pointer) {
                var value = pointer[key];

                if (type === 'object') key = '\'' + key + '\'';

                keys.push(key);
                type = (0, _lutilsTypeof2.default)(value); // Ensures type matches the wrapper for keys

                switch (type) {
                    case 'object':
                        if (this._isSearch(value)) return { keys: keys, search: value };

                    case 'array':
                    case 'object':
                        return this._parseTree(value, keys);

                    default:
                        return { keys: keys, search: { $eq: value } };
                }
            }
        }
    }]);

    return JsonbQuery;
}();