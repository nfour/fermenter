import { IGherkinParserConfig, parseFeature } from './parseFeature';
import { IGherkinMethods } from './types';
import { executeFeature } from './executeFeature';

export function GherkinTest ({ feature }: IGherkinParserConfig, configuration: (t: IGherkinMethods) => void) {
  const { featureBuilder, ast } = parseFeature({ feature, stackIndex: 3 });

  console.dir(ast, { depth: 10, colors: true });

  /**
   * TODO:
   * - read the feature file, parse out & match:
   *   - scenario name -> test(name)
   *   - feature name -> describe(name)
   *   - background name -> beforeAll(() => background())
   *   - tags
   *     - test(`${name} ${tags.map((tag) => `@${tag}`).join(' ')}`)
   *     - same for the describe()
   *
   * - after `methodsSetup`
   *   - execute the executeFeature based on the now-populated FeatureBuilder instance
   *
   *
   *
   *
   */

  const methods = <IGherkinMethods>{
    Scenario: featureBuilder.Scenario(),
    ScenarioOutline: featureBuilder.ScenarioOutline(),
    Background: featureBuilder.Background(),
  };

  return test('test', async () => {
    configuration(methods);
    executeFeature({ featureBuilder, ast })
  });
}
