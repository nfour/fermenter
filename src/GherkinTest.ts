import { executeFeature } from './executeFeature';
import { IGherkinParserConfig, parseFeature } from './parseFeature';
import { IGherkinAst, IGherkinMethods, IGherkinOperations, IGherkinScenario } from './types';

export function GherkinTest ({ feature }: IGherkinParserConfig, configure: (t: IGherkinMethods) => void) {
  const { featureBuilder, ast } = parseFeature({ feature, stackIndex: 3 });

  console.dir(ast, { depth: 10, colors: true });

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

    /**
     * TODO: constraints:
     * - tests must be defined statically in order to ensure filtering etc. works
     */

    executeFeature({ featureBuilder, ast });
  });
}

function testGherkinOperations (operations: IGherkinOperations) {
  operations.forEach((operation, match) => {
    test(match.toString(), operation);
  });
}

function describeScenario (scenario: IGherkinScenario) {
  // TODO: wheres my background @?
  describe(scenario.match.toString(), () => {
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
