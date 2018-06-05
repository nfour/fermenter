import { IGherkinParserConfig, parseFeature } from './parseFeature';
import { IGherkinMethods } from './types';

export function GherkinTest ({ feature }: IGherkinParserConfig, methodsSetup: (t: IGherkinMethods) => void) {
  const { builder, ast, methods } = parseFeature({ feature, stackIndex: 3 });

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

  return test('test', async () => {
    await methodsSetup(methods);

  });
}
