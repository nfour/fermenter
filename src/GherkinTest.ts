import { executeFeature } from './executeFeature';
import { IGherkinParserConfig, parseFeature } from './parseFeature';
import { IGherkinAst, IGherkinMethods, IGherkinOperationStore, IGherkinScenario } from './types';

export function GherkinTest ({ feature }: IGherkinParserConfig, configure: (t: IGherkinMethods) => void) {
  const { featureBuilder, ast } = parseFeature({ feature, stackIndex: 3 });

  const methods = <IGherkinMethods> {
    Scenario: featureBuilder.Scenario(),
    ScenarioOutline: featureBuilder.ScenarioOutline(),
    Background: featureBuilder.Background(),
  };

  const featureTitle = extractFeatureTestTitle(ast);

  return describe(featureTitle, async () => {
    configure(methods);

    const { Background, ScenarioOutlines, Scenarios } = featureBuilder.feature;

    Scenarios.forEach(describeScenario);

    // TODO: outlines
    // TODO: background

    executeFeature({ featureBuilder, ast });
  });
}

function testGherkinOperations (operations: IGherkinOperationStore, initialState = {}) {

  let state: any = initialState;

  // TODO: this needs to be wrapped in state machine
  operations.forEach((operation, match) => {

    const testName = match.toString();

    test(testName, async () => {
      // TODO: must run expression parser here on `match` to extract params
      const params: any[] = [];

      const returnedState = await operation.fn(state, ...params);

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

function extractFeatureTestTitle (ast: IGherkinAst): string {
  const tags = ast.feature.tags
    ? `${ast.feature.tags.map(({ name }) => name).join(' ')}`
    : '';

  return [
    `${ast.feature.name} ${tags}`,
    `${ast.feature.description || ''}`,
  ].join('\n');
}
