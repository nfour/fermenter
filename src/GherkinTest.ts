import { executeFeature } from './executeFeature';
import { IGherkinParserConfig, parseFeature } from './parseFeature';
import { IGherkinAstFeature, IGherkinMethods, IGherkinOperationStore, IGherkinScenario } from './types';

export function GherkinTest ({ feature }: IGherkinParserConfig, configure: (t: IGherkinMethods) => void) {
  const { featureBuilder, ast } = parseFeature({ feature, stackIndex: 3 });

  const methods = <IGherkinMethods> {
    Scenario: featureBuilder.Scenario(),
    ScenarioOutline: featureBuilder.ScenarioOutline(),
    Background: featureBuilder.Background(),
  };

  const featureTitle = extractFeatureTestTitle(ast.feature);

  describe(featureTitle, async () => {
    configure(methods);

    console.dir(featureBuilder.feature, { depth: 10, colors: true });

    const { Background, ScenarioOutlines, Scenarios } = featureBuilder.feature;

    Background;
    ScenarioOutlines;

    Scenarios.forEach(describeScenario);

    // TODO: outlines
    // TODO: background

    executeFeature({ featureBuilder, ast });
  });
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
