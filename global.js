(function (global, factory) {
function optional(name) { try { return require(name) } catch(e) {} }
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(optional("mocha")) :
  typeof define === 'function' && define.amd ? define(['optional!mocha'], factory) :
  (global = global || self, factory(global.Mocha));
}(this, function (mocha$1) { 'use strict';

  mocha$1 = mocha$1 && mocha$1.hasOwnProperty('default') ? mocha$1['default'] : mocha$1;

  var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  var indentity = function indentity(x) {
    return x;
  };

  var symbol = {
    for: typeof Symbol === 'undefined' ? indentity : Symbol.for
  };

  var LAZY_VARS_FIELD = symbol.for('__lazyVars');
  var EXAMPLES_PREFIX = '__SH_EX:';

  var VariableMetadata =
  /*#__PURE__*/
  function () {
    function VariableMetadata(name, definition, metadata) {
      var _this$names;

      this.value = definition;
      this.parent = metadata;
      this.names = (_this$names = {}, _this$names[name] = true, _this$names);
    }

    var _proto = VariableMetadata.prototype;

    _proto.addName = function addName(name) {
      this.names[name] = true;
      return this;
    };

    _proto.isNamedAs = function isNamedAs(name) {
      return this.names[name];
    };

    _proto.evaluate = function evaluate() {
      return typeof this.value === 'function' ? this.value() : this.value;
    };

    return VariableMetadata;
  }();

  var Metadata =
  /*#__PURE__*/
  function () {
    Metadata.of = function of(context, varName) {
      var metadata = context[LAZY_VARS_FIELD];
      return varName && metadata ? metadata.defs[varName] : metadata;
    };

    Metadata.ensureDefinedOn = function ensureDefinedOn(context) {
      if (!context.hasOwnProperty(LAZY_VARS_FIELD)) {
        context[LAZY_VARS_FIELD] = new Metadata();
      }

      return context[LAZY_VARS_FIELD];
    };

    function Metadata() {
      this.defs = {};
      this.values = {};
      this.hasValues = false;
      this.defined = false;
    }

    var _proto2 = Metadata.prototype;

    _proto2.getVar = function getVar(name) {
      if (!this.values.hasOwnProperty(name) && this.defs[name]) {
        this.hasValues = true;
        this.values[name] = this.evaluate(name);
      }

      return this.values[name];
    };

    _proto2.evaluate = function evaluate(name) {
      return this.defs[name].evaluate();
    };

    _proto2.addChild = function addChild(child) {
      child.defs = _extends(Object.create(this.defs), child.defs);
      child.parent = this.defined ? this : this.parent;
    };

    _proto2.addVar = function addVar(name, definition) {
      if (this.defs.hasOwnProperty(name)) {
        throw new Error("Cannot define \"" + name + "\" variable twice in the same suite.");
      }

      this.defined = true;
      this.defs[name] = new VariableMetadata(name, definition, this);
      return this;
    };

    _proto2.addAliasFor = function addAliasFor(name, aliasName) {
      this.defs[aliasName] = this.defs[name].addName(aliasName);
    };

    _proto2.releaseVars = function releaseVars() {
      if (this.hasValues) {
        this.values = {};
        this.hasValues = false;
      }
    };

    _proto2.lookupMetadataFor = function lookupMetadataFor(varName) {
      var varMeta = this.defs[varName];
      var definedIn = varMeta.parent;

      if (!varMeta || !definedIn.parent.defs[varName]) {
        throw new Error("Unknown parent variable \"" + varName + "\".");
      }

      return definedIn.parent;
    };

    _proto2.addExamplesFor = function addExamplesFor(name, definition) {
      var examplesName = EXAMPLES_PREFIX + name;

      if (this.defs.hasOwnProperty(examplesName)) {
        throw new Error("Attempt to override \"" + name + "\" shared example");
      }

      return this.addVar(examplesName, definition);
    };

    _proto2.runExamplesFor = function runExamplesFor(name, args) {
      var examples = this.defs[EXAMPLES_PREFIX + name];

      if (!examples) {
        throw new Error("Attempt to include not defined shared behavior \"" + name + "\"");
      }

      return examples.value.apply(examples, args);
    };

    return Metadata;
  }();

  var metadata = {
    Metadata: Metadata
  };

  var Metadata$1 = metadata.Metadata;
  var CURRENTLY_RETRIEVED_VAR_FIELD = symbol.for('__currentVariableStack');

  var last = function last(array) {
    return array ? array[array.length - 1] : null;
  };

  var Variable =
  /*#__PURE__*/
  function () {
    Variable.allocate = function allocate(varName, options) {
      var variable = new this(varName, options.in);
      return variable.addToStack();
    };

    Variable.evaluate = function evaluate(varName, options) {
      if (!options.in) {
        throw new Error("It looke like you are trying to evaluate \"" + varName + "\" too early. Evaluation context is undefined");
      }

      var variable = Variable.fromStack(options.in);

      if (variable.isSame(varName)) {
        return variable.valueInParentContext(varName);
      }

      try {
        variable = Variable.allocate(varName, options);
        return variable.value();
      } finally {
        variable.pullFromStack();
      }
    };

    Variable.fromStack = function fromStack(context) {
      return last(context[CURRENTLY_RETRIEVED_VAR_FIELD]) || Variable.EMPTY;
    };

    function Variable(varName, context) {
      this.name = varName;
      this.context = context;
      this.evaluationMeta = context ? Metadata$1.of(context) : null;
    }

    var _proto = Variable.prototype;

    _proto.isSame = function isSame(anotherVarName) {
      return this.name && (this.name === anotherVarName || Metadata$1.of(this.context, this.name).isNamedAs(anotherVarName));
    };

    _proto.value = function value() {
      return this.evaluationMeta && this.evaluationMeta.getVar(this.name);
    };

    _proto.addToStack = function addToStack() {
      this.context[CURRENTLY_RETRIEVED_VAR_FIELD] = this.context[CURRENTLY_RETRIEVED_VAR_FIELD] || [];
      this.context[CURRENTLY_RETRIEVED_VAR_FIELD].push(this);
      return this;
    };

    _proto.pullFromStack = function pullFromStack() {
      this.context[CURRENTLY_RETRIEVED_VAR_FIELD].pop();
    };

    _proto.valueInParentContext = function valueInParentContext(varOrAliasName) {
      var meta = this.evaluationMeta;

      try {
        this.evaluationMeta = meta.lookupMetadataFor(varOrAliasName);
        return this.evaluationMeta.evaluate(varOrAliasName);
      } finally {
        this.evaluationMeta = meta;
      }
    };

    return Variable;
  }();

  Variable.EMPTY = new Variable(null, null);
  var variable = Variable;

  var parse_message = function parseMessage(fn) {
    var matches = fn.toString().match(/is\.expected\.(\s+(?=\.)|.)+/g);

    if (!matches) {
      return '';
    }

    var prefixLength = 'is.expected.'.length;
    var body = matches.reduce(function (message, chunk) {
      return message.concat(chunk.trim().slice(prefixLength).replace(/[\s.]+/g, ' ').replace(/([a-z])([A-Z])/g, function (_, before, letter) {
        return before + " " + letter.toLowerCase();
      }).replace(/ and /g, ', '));
    }, []);
    return "is expected " + body.join(', ');
  };

  var Metadata$2 = metadata.Metadata;

  var _interface = function _interface(context, tracker, options) {
    var get = function get(varName) {
      return variable.evaluate(varName, {
        in: tracker.currentContext
      });
    };

    get.definitionOf = get.variable = function (varName) {
      return get.bind(null, varName);
    };

    function def(varName, definition) {
      var suite = tracker.currentlyDefinedSuite;

      if (!Array.isArray(varName)) {
        Metadata$2.ensureDefinedOn(suite).addVar(varName, definition);
        runHook('onDefineVariable', suite, varName);
        return;
      }

      var name = varName[0],
          aliases = varName.slice(1);
      def(name, definition);
      var metadata = Metadata$2.of(suite);
      aliases.forEach(function (alias) {
        metadata.addAliasFor(name, alias);
        runHook('onDefineVariable', suite, alias);
      });
    }

    function subject() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var name = args[0],
          definition = args[1];

      if (args.length === 1) {
        return def('subject', name);
      }

      if (args.length === 2) {
        return def([name, 'subject'], definition);
      }

      return get('subject');
    }

    function sharedExamplesFor(name, defs) {
      Metadata$2.ensureDefinedOn(tracker.currentlyDefinedSuite).addExamplesFor(name, defs);
    }

    function includeExamplesFor(name) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      Metadata$2.ensureDefinedOn(tracker.currentlyDefinedSuite).runExamplesFor(name, args);
    }

    function itBehavesLike(name) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      context.describe("behaves like " + name, function () {
        args.unshift(name);
        includeExamplesFor.apply(tracker.currentlyDefinedSuite, args);
      });
    }

    var wrapIts = function wrapIts(test) {
      return function its(prop, messageOrAssert, fn) {
        var _ref = typeof messageOrAssert === 'function' ? [parse_message(messageOrAssert), messageOrAssert] : [messageOrAssert, fn],
            message = _ref[0],
            assert = _ref[1];

        return context.describe(prop, function () {
          def('__itsSubject__', function () {
            return prop.split('.').reduce(function (object, field) {
              var value = object[field];
              return typeof value === 'function' ? object[field]() : value;
            }, subject());
          });
          test(message || 'is correct', assert);
        });
      };
    }; // TODO: `shouldWrapAssert` can be removed when https://github.com/facebook/jest/issues/6516 fixed


    var wrapIt = function wrapIt(test, shouldWrapAssert) {
      return function it() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        if (typeof args[0] === 'function') {
          args.unshift(parse_message(args[0]));
        }

        if (shouldWrapAssert) {
          var assert = args[1];

          args[1] = function testWrapper() {
            for (var _len5 = arguments.length, testArgs = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
              testArgs[_key5] = arguments[_key5];
            }

            var value = assert.apply(this, testArgs);
            return value && typeof value.then === 'function' ? value : undefined;
          };
        }

        return test.apply(void 0, args);
      };
    };

    function runHook(name, suite, varName) {
      if (name && typeof options[name] === 'function') {
        options[name](suite, varName, context);
      }
    }

    var is = {
      get expected() {
        var name = Metadata$2.of(tracker.currentContext, '__itsSubject__') ? '__itsSubject__' : 'subject';
        return context.expect(get(name));
      }

    };
    return {
      subject: subject,
      def: def,
      get: get,
      wrapIt: wrapIt,
      wrapIts: wrapIts,
      is: is,
      sharedExamplesFor: sharedExamplesFor,
      includeExamplesFor: includeExamplesFor,
      itBehavesLike: itBehavesLike
    };
  };

  var Metadata$3 = metadata.Metadata;

  var SuiteTracker =
  /*#__PURE__*/
  function () {
    function SuiteTracker(config) {
      if (config === void 0) {
        config = {};
      }

      this.state = {
        currentlyDefinedSuite: config.rootSuite,
        contexts: [config.rootSuite]
      };
      this.suiteTracker = config.suiteTracker;
      this.suites = [];
      this.cleanUpCurrentContext = this.cleanUpCurrentContext.bind(this);
      this.cleanUpCurrentAndRestorePrevContext = this.cleanUpCurrentAndRestorePrevContext.bind(this);
    }

    var _proto = SuiteTracker.prototype;

    _proto.wrapSuite = function wrapSuite(describe) {
      var tracker = this;
      return function detectSuite(title, defineTests) {
        for (var _len = arguments.length, suiteArgs = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          suiteArgs[_key - 2] = arguments[_key];
        }

        return describe.apply(void 0, [title, function defineSuite() {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          tracker.trackSuite(this, defineTests, args);
        }].concat(suiteArgs));
      };
    };

    _proto.trackSuite = function trackSuite(suite, defineTests, args) {
      var previousDefinedSuite = this.state.currentlyDefinedSuite;
      this.defineMetaFor(suite);
      this.state.currentlyDefinedSuite = suite;
      this.execute(defineTests, suite, args);
      this.state.currentlyDefinedSuite = previousDefinedSuite;
    };

    _proto.defineMetaFor = function defineMetaFor(suite) {
      var meta = Metadata$3.ensureDefinedOn(suite);
      var parentMeta = Metadata$3.of(suite.parent || suite.parentSuite);

      if (parentMeta) {
        parentMeta.addChild(meta);
      }
    };

    _proto.execute = function execute(defineTests, suite, args) {
      this.suiteTracker.before(this, suite);
      defineTests.apply(suite, args);

      if (Metadata$3.of(suite)) {
        this.suiteTracker.after(this, suite);
      }
    };

    _proto.isRoot = function isRoot(suite) {
      return !(suite.parent ? suite.parent.parent : suite.parentSuite.parentSuite);
    };

    _proto.registerSuite = function registerSuite(context) {
      this.state.contexts.push(context);
    };

    _proto.cleanUp = function cleanUp(context) {
      var metadata = Metadata$3.of(context);

      if (metadata) {
        metadata.releaseVars();
      }
    };

    _proto.cleanUpCurrentContext = function cleanUpCurrentContext() {
      this.cleanUp(this.currentContext);
    };

    _proto.cleanUpCurrentAndRestorePrevContext = function cleanUpCurrentAndRestorePrevContext() {
      this.cleanUpCurrentContext();
      this.state.contexts.pop();
    };

    _createClass(SuiteTracker, [{
      key: "currentContext",
      get: function get() {
        return this.state.contexts[this.state.contexts.length - 1];
      }
    }, {
      key: "currentlyDefinedSuite",
      get: function get() {
        return this.state.currentlyDefinedSuite;
      }
    }]);

    return SuiteTracker;
  }();

  var suite_tracker = SuiteTracker;

  function createSuiteTracker() {
    return {
      before: function before(tracker, suite) {
        global$1.beforeAll(tracker.registerSuite.bind(tracker, suite));
        global$1.afterAll(tracker.cleanUpCurrentAndRestorePrevContext);
      },
      after: function after(tracker) {
        global$1.beforeAll(tracker.cleanUpCurrentContext);
      }
    };
  }

  function addInterface(rootSuite, options) {
    var context = global$1;
    var tracker = new options.Tracker({
      rootSuite: rootSuite,
      suiteTracker: createSuiteTracker()
    });

    var _createLazyVarInterfa = _interface(context, tracker, options),
        wrapIts = _createLazyVarInterfa.wrapIts,
        wrapIt = _createLazyVarInterfa.wrapIt,
        ui = _objectWithoutPropertiesLoose(_createLazyVarInterfa, ["wrapIts", "wrapIt"]);

    var isJest = typeof jest !== 'undefined';

    _extends(context, ui);

    ['', 'x', 'f'].forEach(function (prefix) {
      var describeKey = prefix + "describe";
      var itKey = prefix + "it";
      var originalIt = context[itKey];
      var originalDescribe = context[describeKey];
      context[itKey + "s"] = wrapIts(originalIt);
      context[itKey] = wrapIt(originalIt, isJest);
      Object.keys(originalIt).forEach(function (key) {
        context[itKey][key] = originalIt[key];
      });
      context[describeKey] = tracker.wrapSuite(originalDescribe);
      Object.keys(originalDescribe).forEach(function (key) {
        context[describeKey][key] = originalDescribe[key];
      });
      context[prefix + "context"] = context[describeKey];
    });
    context.afterEach(tracker.cleanUpCurrentContext);
    return ui;
  }

  var jasmine = {
    createUi: function createUi(name, options) {
      var config = _extends({
        Tracker: suite_tracker
      }, options);

      return addInterface(global$1.jasmine.getEnv().topSuite(), config);
    }
  };

  var jest$1 = jasmine;

  function createSuiteTracker$1() {
    return {
      before: function before(tracker, suite) {
        suite.beforeAll(tracker.registerSuite.bind(tracker, suite));
      },
      after: function after(tracker, suite) {
        suite.beforeAll(tracker.cleanUpCurrentContext);
        suite.afterAll(tracker.cleanUpCurrentAndRestorePrevContext);
      }
    };
  }

  function addInterface$1(rootSuite, options) {
    var tracker = new options.Tracker({
      rootSuite: rootSuite,
      suiteTracker: createSuiteTracker$1()
    });
    var ui;
    rootSuite.afterEach(tracker.cleanUpCurrentContext);
    rootSuite.on('pre-require', function (context) {
      var describe = context.describe,
          it = context.it;

      if (!ui) {
        ui = _interface(context, tracker, options);

        var _ui = ui,
            wrapIts = _ui.wrapIts,
            wrapIt = _ui.wrapIt,
            restUi = _objectWithoutPropertiesLoose(_ui, ["wrapIts", "wrapIt"]);

        _extends(context, restUi);
      }

      context.its = ui.wrapIts(it);
      context.its.only = ui.wrapIts(it.only);
      context.its.skip = ui.wrapIts(it.skip);
      context.it = ui.wrapIt(it);
      context.it.only = ui.wrapIt(it.only);
      context.it.skip = ui.wrapIt(it.skip);
      context.describe = tracker.wrapSuite(describe);
      context.describe.skip = tracker.wrapSuite(describe.skip);
      context.describe.only = tracker.wrapSuite(describe.only);
      context.context = context.describe;
      context.xdescribe = context.xcontext = context.describe.skip;
    });
  }

  var mocha = {
    createUi: function createUi(name, options) {
      var config = _extends({
        Tracker: suite_tracker,
        inheritUi: 'bdd'
      }, options);

      mocha$1.interfaces[name] = function (rootSuite) {
        mocha$1.interfaces[config.inheritUi](rootSuite);
        return addInterface$1(rootSuite, config);
      };

      var getters = ['get', 'def', 'subject', 'its', 'it', 'is', 'sharedExamplesFor', 'includeExamplesFor', 'itBehavesLike'];
      var defs = getters.reduce(function (all, uiName) {
        all[uiName] = {
          get: function get() {
            return global$1[uiName];
          }
        };
        return all;
      }, {});
      return Object.defineProperties(mocha$1.interfaces[name], defs);
    }
  };

  var Mocha;

  try {
    Mocha = mocha$1; // eslint-disable-line
  } catch (e) {// eslint-disable-line
  }

  var ui;

  if (typeof jest !== 'undefined') {
    ui = jest$1; // eslint-disable-line
  } else if (global$1.jasmine) {
    ui = jasmine; // eslint-disable-line
  } else if (Mocha) {
    ui = mocha; // eslint-disable-line
  }

  if (!ui) {
    throw new Error("\n    Unable to detect testing framework. Make sure that\n      * jest, jasmine or mocha is installed\n      * bdd-lazy-var is included after \"jasmine\" or \"mocha\"\n  ");
  }

  var _interface$1 = ui;

  var prop = symbol.for;
  var LAZY_VARS_PROP_NAME = prop('__lazyVars');

  function defineGetter(context, varName, options) {
    var params = _extends({
      getterPrefix: '',
      defineOn: context
    }, options);

    var accessorName = params.getterPrefix + varName;
    var varContext = params.defineOn;
    var vars = varContext[LAZY_VARS_PROP_NAME] = varContext[LAZY_VARS_PROP_NAME] || {};

    if (accessorName in vars) {
      return;
    }

    if (accessorName in varContext) {
      throw new Error("Cannot create lazy variable \"" + varName + "\" as variable with the same name exists on the provided context");
    }

    vars[accessorName] = true;
    Object.defineProperty(varContext, accessorName, {
      configurable: true,
      get: function get() {
        return context.get(varName);
      }
    });
  }

  var define_var = defineGetter;

  var bdd_global_var = _interface$1.createUi('bdd-lazy-var/global', {
    onDefineVariable: function onDefineVariable(suite, varName, context) {
      define_var(context, varName, {
        getterPrefix: '$'
      });
    }
  });

  return bdd_global_var;

}));
