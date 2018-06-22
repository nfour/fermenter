import { writeJsonSync } from 'fs-extra';
import { join } from 'path';

import { FeatureBuilder } from './FeatureBuilder';
import { deferredPromise } from './lib/utils';
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

export function GherkinTest ({ feature }: IGherkinParserConfig, configure: IConfigureFn) {
  // TODO: stop erroring here, instead `describe` first so we dont have test-less jest files
  const { featureBuilder, ast } = parseFeature({ feature, stackIndex: 3 });

  writeJsonSync(join(__dirname, '../reference/ast.json'), ast, { spaces: 2 });

  describeFeature({ ast, configure, featureBuilder });
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
      const whenConfigured = deferredPromise();

      const methods = <IGherkinMethods> {
        Scenario: featureBuilder.Scenario(),
        ScenarioOutline: featureBuilder.ScenarioOutline(whenConfigured),
        Background: featureBuilder.Background(),
      };

      configure(methods);

      whenConfigured.resolve();

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
    // TODO: must also populate @tags etc. like feature title

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
  const tags = inputTags
    ? ` ${inputTags.map((tag) => tag.name).join(' ')}`
    : '';

  return [
    `${name}${tags}`,
    `  ${description}`,
  ]
    .filter(Boolean)
    .join('\n');
}
