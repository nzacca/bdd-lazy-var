const createLazyVarInterface = require('../interface');
const SuiteTracker = require('../suite_tracker');

function createSuiteTracker() {
  return {
    before(tracker, suite) {
      global.beforeAll(tracker.registerSuite.bind(tracker, suite));
      global.afterAll(tracker.cleanUpCurrentAndRestorePrevContext);
    },

    after(tracker) {
      global.beforeAll(tracker.cleanUpCurrentContext);
    }
  };
}

function addInterface(rootSuite, options) {
  const context = global;
  const tracker = new options.Tracker({ rootSuite, suiteTracker: createSuiteTracker() });
  const { wrapIts, wrapIt, ...ui } = createLazyVarInterface(context, tracker, options);
  const isJest = typeof jest !== 'undefined';

  Object.assign(context, ui);
  ['', 'x', 'f'].forEach((prefix) => {
    const describeKey = `${prefix}describe`;
    const itKey = `${prefix}it`;
    const originalIt = context[itKey];
    const originalDescribe = context[describeKey];

    context[`${itKey}s`] = wrapIts(originalIt);
    context[itKey] = wrapIt(originalIt, isJest);
    Object.keys(originalIt).forEach(key => { context[itKey][key] = originalIt[key]; });

    context[describeKey] = tracker.wrapSuite(originalDescribe);
    Object.keys(originalDescribe).forEach(key => { context[describeKey][key] = originalDescribe[key]; });
    context[`${prefix}context`] = context[describeKey];
  });
  context.afterEach(tracker.cleanUpCurrentContext);

  return ui;
}

module.exports = {
  createUi(name, options) {
    const config = Object.assign({
      Tracker: SuiteTracker,
    }, options);

    return addInterface(global.jasmine.getEnv().topSuite(), config);
  }
};
