import { FeatureBuilder } from './FeatureBuilder';
import { IGherkinParserConfig, parseFeature } from './parseFeature';
import {
  IGherkinAst,
  IGherkinAstEntity,
  IGherkinBackground,
  IGherkinMethods,
  IGherkinOperationStore,
  IGherkinScenario,
  IGherkinStep,
} from './types';

export type IConfigureFn = (t: IGherkinMethods) => void;

export interface ITestRunnerApi {
  describe: jest.Describe;
  test: jest.It;

  beforeEach: jest.It;
  afterEach: jest.It;
  beforeAll: jest.It;
  afterAll: jest.It;
}

export interface IGherkinTestParams extends IGherkinParserConfig {
  runner?: ITestRunnerApi;
}

export function GherkinTest ({ feature }: IGherkinTestParams, configure: IConfigureFn) {
  const { featureBuilder, ast } = parseFeature({ feature, stackIndex: 3 });

  // FIXME: remove later
  // writeFileSync(join(__dirname, './tests/reference/ast.json'), JSON.stringify(ast, null, 2));

  describeFeature({ ast, configure, featureBuilder });

  return { ast, feature };
}

export type IOnConfigured = (callback: () => void) => void;

function configureMethods ({ configure, featureBuilder }: {
  featureBuilder: FeatureBuilder;
  configure: IConfigureFn
}) {
  let resolve: () => void;

  const onConfigured: IOnConfigured = (callback) => {
    resolve = callback;
  };

  const methods = <IGherkinMethods> {
    Scenario: featureBuilder.Scenario(),
    ScenarioOutline: featureBuilder.ScenarioOutline(onConfigured),
    Background: featureBuilder.Background(),
  };

  configure(methods);

  resolve!();
}

function describeFeature ({ featureBuilder, ast, configure }: {
  featureBuilder: FeatureBuilder;
  ast: IGherkinAst;
  configure: IConfigureFn;
}) {

  let error: undefined|Error;
  const title = formatTitle(ast.feature);

  describe(title, async () => {
    try {
      configureMethods({ configure, featureBuilder });

      const { scenarios, background } = featureBuilder.feature;

      scenarios.forEach((scenario) => {
        describeScenario({
          scenario,
          background,
          initialState: undefined, // TODO: state meeee
        });
      });
    } catch (e) {
      error = e;
    }
  });

  if (error) {
    throw error;
  }
}

function describeGherkinOperations (steps: IGherkinOperationStore, initialState: any) {
  let state = initialState;

  steps.forEach((step) => {
    const title = formatTitle({ name: step.name });

    test(title, async () => {
      const nextState = await executeStep(step, state);

      state = nextState;
    }, 99999); // TODO: add timeout config opt
  });
}

async function executeStep (step: IGherkinStep, initialState: any) {
  const state = await step.fn(initialState, ...step.params);

  if (state !== undefined) {
    return state;
  }

  return initialState;
}

function describeScenario ({ background, scenario, initialState }: {
  scenario: IGherkinScenario,
  initialState: any,
  background?: IGherkinBackground,
}) {
  const title = formatTitle(scenario.gherkin);

  describe(title, () => {
    let state = initialState;

    if (background && background.Given) {
      background.Given.forEach((step) => {
        beforeAll(async () => {
          const nextState = await executeStep(step, state);

          state = nextState;
        });
      });
    }

    const scenarioSteps = new Map([
      ...scenario.Given || [],
      ...scenario.When || [],
      ...scenario.Then || [],
    ]);

    describeGherkinOperations(scenarioSteps, state);
  });
}

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
