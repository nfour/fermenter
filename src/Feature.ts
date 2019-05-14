import { FeatureBuilder } from './FeatureBuilder';
import { globalBeforeEachStepHooks } from './globallyBeforeEachStep';
import { getGlobalTestMethods } from './lib/getGlobalTestMethods';
import { IGherkinParserConfig, parseFeature } from './lib/parseFeature';
import {
  IGherkinAst, IGherkinAstEntity, IGherkinBackground, IGherkinFeatureTest, IGherkinMethods, IGherkinScenario,
  IGherkinStep, IGherkinTestSupportFlags, IHookFn,
} from './types';

export type IConfigureFn = (t: IGherkinMethods) => void;

export interface IDescribe {
  (name: string, fn: () => Promise<any>|any): void;
  skip: IDescribe;
  only: IDescribe;
}

export interface ITest {
  (name: string, fn: () => Promise<any>|any, timeout?: number): void;
  skip: ITest;
  only: ITest;
}

export interface ITestMethods {
  describe: IDescribe;
  test: ITest;
  beforeAll: IHookFn;
  afterAll: IHookFn;
}

export interface IGherkinTestParams extends IGherkinParserConfig {
  methods?: ITestMethods;
  defaultTimeout?: number;
}

/**
 * Create a gherkin test based on a feature file
 */
export function Feature (config: IGherkinTestParams | IGherkinTestParams['feature'], configure: IConfigureFn) {
  const { feature, methods = getGlobalTestMethods(), defaultTimeout } = <IGherkinTestParams> (
    typeof config === 'string'
      ? { feature: config }
      : config
  );

  const { featureBuilder, ast } = parseFeature({ feature, stackIndex: 3 });

  describeFeature({ ast, configure, featureBuilder, methods, defaultTimeout });

  return { ast, featureBuilder };
}

export const GherkinTest = Feature;

export type IOnConfigured = (callback: () => void) => void;

/** Ensures correct synchronous execution of the configuration stage */
function configureMethods ({ configure, featureBuilder }: {
  featureBuilder: FeatureBuilder;
  configure: IConfigureFn
}) {
  let resolve: undefined | (() => void);

  const onConfigured: IOnConfigured = (callback) => {
    resolve = callback;
  };

  const methods = <IGherkinMethods> {
    Scenario: featureBuilder.Scenario(),
    ScenarioOutline: featureBuilder.ScenarioOutline(onConfigured),
    Background: featureBuilder.Background(),
    BeforeEach: featureBuilder.BeforeEach(),
    BeforeAll: featureBuilder.BeforeAll(),
    AfterEach: featureBuilder.AfterEach(),
    AfterAll: featureBuilder.AfterAll(),
  };

  configure(methods);

  if (resolve) { resolve(); }
}

/** Intruments the gherkin feature test in the test framework */
function describeFeature ({ featureBuilder, ast, configure, methods, defaultTimeout }: {
  featureBuilder: FeatureBuilder;
  ast: IGherkinAst;
  configure: IConfigureFn;
  methods: ITestMethods;
  defaultTimeout?: number;
}) {

  let error: undefined|Error;
  const title = formatTitle({
    ...ast.feature,
    prefix: 'Feature:',
  });

  methods.describe(title, () => {
    try {
      configureMethods({ configure, featureBuilder });

      const {
        background,
        scenarios,
        beforeAll: beforeAllHooks,
        afterAll: afterAllHooks,
        afterEach: afterEachHooks,
        beforeEach: beforeEachHooks,
      } = featureBuilder.feature;

      afterAllHooks.forEach(({ fn, timeout = defaultTimeout }) => { methods.afterAll(fn, timeout); });
      beforeAllHooks.forEach(({ fn, timeout = defaultTimeout }) => { methods.beforeAll(fn, timeout); });

      scenarios.forEach((scenario) => {
        describeScenario({
          background, scenario,
          afterEachHooks, beforeEachHooks,
          methods, defaultTimeout,
          initialState: undefined,
        });
      });
    } catch (e) {
      error = e;
    }
  });

  if (error) { throw error; }
}

/** Executes a step function and ensures state passing */
async function executeStep (step: IGherkinStep, initialState: any) {
  const state = await step.fn(initialState, ...step.params);

  if (state !== undefined) {
    return state;
  }

  return initialState;
}

/** Instruments the tests for a scenario in the test framework */
function describeScenario ({
  initialState, background, scenario,
  beforeEachHooks, afterEachHooks,
  methods, defaultTimeout,
}: {
  scenario: IGherkinScenario,
  initialState: any,
  background?: IGherkinBackground,
  beforeEachHooks: IGherkinFeatureTest['beforeEach']
  afterEachHooks: IGherkinFeatureTest['afterEach'],
  methods: ITestMethods;
  defaultTimeout?: number;
}) {
  const title = formatTitle({
    ...scenario.gherkin,
    prefix: `Scenario:`,
  });

  const { skip, only } = scenario;
  const describe = narrowTestMethod(methods.describe, { skip, only });

  describe(title, () => {
    if (!skip) {
      afterEachHooks.forEach(({ fn, timeout = defaultTimeout }) => { methods.afterAll(fn, timeout); });
      beforeEachHooks.forEach(({ fn, timeout = defaultTimeout }) => { methods.beforeAll(fn, timeout); });
    }

    const steps: ICategorizedSteps = {
      Background: background && background.Given,
      Given: scenario.Given!,
      When: scenario.When!,
      Then: scenario.Then!,
    };

    describeGherkinOperations({ steps, state: initialState, methods });
  });
}

export type ICategorizedSteps = (
  Pick<Required<IGherkinScenario>, 'Given' | 'When' | 'Then'> &
  { Background?: IGherkinBackground['Given']; }
);

/** Instruments step functions in the test framework */
function describeGherkinOperations ({
  state, methods, defaultTimeout,
  steps: {
    Given, Then, When,
    Background = new Map(),
  },
}: {
  steps: ICategorizedSteps,
  state: PromiseLike<any>;
  methods: ITestMethods;
  defaultTimeout?: number;
}) {
  /** Used to determine if previous dependent steps have failed */
  let aStepHasFailed = false;
  let reducedState = state;

  /** Curried fn which assigns a step function to the test framework method 'test' */
  function AssignStep (prefix: string = '') {
    return (step: IGherkinStep) => {
      const title = formatTitle({ name: step.name, prefix });
      const timeout = step.timeout || defaultTimeout;

      const testFn = async () => {
        /** If a previous step failed, just return so we dont get bad execution errors */
        if (aStepHasFailed) { return; }

        try {
          /** Execute the globalBeforeEachStepHooks before the step */
          if (globalBeforeEachStepHooks.length) {
            reducedState = globalBeforeEachStepHooks.reduce((nextState, callback) => {
              return callback(step, nextState, ...step.params);
            }, reducedState);
          }

          reducedState = await executeStep(step, reducedState);

          return reducedState;
        } catch (error) {
          aStepHasFailed = true;

          throw error;
        }
      };

      const testMethod = step.skip ? methods.test.skip : methods.test;

      testMethod(title, testFn, timeout);
    };
  }

  Background.forEach(AssignStep('(Background) Given:'));
  Given.forEach(AssignStep('Given:'));
  When.forEach(AssignStep('When:'));
  Then.forEach(AssignStep('Then:'));
}

/** Resolves to the correct skipping test method based on configuration options */
function narrowTestMethod (method: ITest, { skip, only }: IGherkinTestSupportFlags) {
  if (only) { return method.only; }
  if (skip) { return method.skip; }

  return method;
}

/** Formats a test title based on tags, name and description */
function formatTitle ({
  name,
  tags: inputTags,
  description = '',
  prefix = '',
}: Pick<IGherkinAstEntity, 'description' | 'name' | 'tags'> & { prefix?: string }) {
  const leftPadLines = (str: string, pad = '  ') =>
    str.split('\n').map((line) => `${pad}${line}`).join('\n');

  const tags = inputTags
    ? ` ${inputTags.map((tag) => tag.name).join(' ')}`
    : '';

  const title = `${prefix && `${prefix} `}${name}${tags}`;

  return [
    title,
    `${leftPadLines(description)}`,
  ]
    .filter(Boolean)
    .join('\n').trimRight();
}
