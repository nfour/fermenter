import { FeatureBuilder } from './FeatureBuilder';
import { getGlobalTestMethods } from './lib/getGlobalTestMethods';
import { IGherkinParserConfig, parseFeature } from './parseFeature';
import {
  IGherkinAst,
  IGherkinAstEntity,
  IGherkinBackground,
  IGherkinFeatureTest,
  IGherkinMethods,
  IGherkinOperationStore,
  IGherkinScenario,
  IGherkinStep,
  IHookFn,
} from './types';

export type IConfigureFn = (t: IGherkinMethods) => void;

export type IDescribe = (title: string, fn: () => any) => void;
export type ITest = (name: string, fn: () => Promise<any>|any, timeout?: number) => void;

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

/**
 * Create a gherkin test based on a feature file
 */
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
  const title = formatTitle(ast.feature);

  methods.describe(title, async () => {
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
          scenario,
          background,
          initialState: undefined,
          afterEachHooks, beforeEachHooks,
          methods,
          defaultTimeout,
        });
      });
    } catch (e) {
      error = e;
    }
  });

  if (error) { throw error; }
}

/** Instruments step functions in the test framework */
function describeGherkinOperations ({ initialState, steps, methods, defaultTimeout }: {
  steps: IGherkinOperationStore,
  initialState: any;
  methods: ITestMethods;
  defaultTimeout?: number;
}) {
  let state = initialState;

  steps.forEach((step) => {
    const title = formatTitle({ name: step.name });
    const timeout = step.timeout || defaultTimeout;

    methods.test(title, async () => {
      const nextState = await executeStep(step, state);

      state = nextState;
    }, timeout); // TODO: add timeout config opt
  });
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
  const title = formatTitle(scenario.gherkin);

  methods.describe(title, () => {
    let state = initialState;

    afterEachHooks.forEach(({ fn, timeout = defaultTimeout }) => { methods.afterAll(fn, timeout); });
    beforeEachHooks.forEach(({ fn, timeout = defaultTimeout }) => { methods.beforeAll(fn, timeout); });

    if (background && background.Given) {
      background.Given.forEach((step) => {
        const timeout = step.timeout || defaultTimeout;

        methods.beforeAll(async () => {
          const nextState = await executeStep(step, state);

          state = nextState;
        }, timeout);
      });
    }

    const scenarioSteps = new Map([
      ...scenario.Given || [],
      ...scenario.When || [],
      ...scenario.Then || [],
    ]);

    describeGherkinOperations({ steps: scenarioSteps, initialState: state, methods });
  });
}

/** Formats a test title based on tags, name and description */
function formatTitle ({
  tags: inputTags, name, description = '',
}: Pick<IGherkinAstEntity, 'description' | 'name' | 'tags'>) {
  const leftPadLines = (str: string, pad = '  ') =>
    str.split('\n').map((line) => `${pad}${line}`).join('\n');

  const tags = inputTags
    ? ` ${inputTags.map((tag) => tag.name).join(' ')}`
    : '';

  return [
    `${name}${tags}`,
    `${leftPadLines(description)}`,
  ]
    .filter(Boolean)
    .join('\n').trimRight();
}
