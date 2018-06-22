import { writeJsonSync } from 'fs-extra';
import { join } from 'path';
import { executeFeature } from './executeFeature';
import { FeatureBuilder } from './FeatureBuilder';
import { deferredPromise } from './lib/utils';
import { IGherkinParserConfig, parseFeature } from './parseFeature';
import { IGherkinAst, IGherkinAstFeature, IGherkinMethods, IGherkinOperationStore, IGherkinScenario } from './types';

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
  const featureTitle = extractFeatureTestTitle(ast.feature);

  let error: undefined|Error;

  describe(featureTitle, async () => {
    try {
      const whenConfigured = deferredPromise();

      const methods = <IGherkinMethods> {
        Scenario: featureBuilder.Scenario(),
        ScenarioOutline: featureBuilder.ScenarioOutline(whenConfigured),
        Background: featureBuilder.Background(),
      };

      configure(methods);

      whenConfigured.resolve();

      const { Scenarios } = featureBuilder.feature;

      Scenarios.forEach(describeScenario);

      // TODO: outlines should populate Scenarios or require joining with existing Scenarios
      // TODO: background

      executeFeature({ featureBuilder, ast });
    } catch (e) {
      error = e;
    }
  });

  if (error) {
    throw error;
  }
}

function testGherkinOperations (operations: IGherkinOperationStore, initialState = {}) {
  let state: any = initialState;

  // TODO: this needs to be wrapped in state machine
  operations.forEach((operation) => {
    // TODO: must also populate @tags etc. like feature title
    test(operation.name, async () => {
      const returnedState = await operation.fn(state, ...operation.params);

      if (returnedState !== undefined) { state = returnedState; }
    }, 99999); // TODO: add timeout config opt
  });
}

function describeScenario (scenario: IGherkinScenario) {
  // TODO: wheres my background @?

  describe(scenario.match.toString(), () => {
    // TODO: define state here
    testGherkinOperations(new Map([
      ...scenario.Given || [],
      ...scenario.When || [],
      ...scenario.Then || [],
    ]));
  });
}

function extractFeatureTestTitle (feature: IGherkinAstFeature): string {
  const tags = feature.tags
    ? `${feature.tags.map(({ name }) => name).join(' ')}`
    : '';

  return [
    `${feature.name} ${tags}`,
    `${feature.description || ''}`,
  ].join('\n');
}
