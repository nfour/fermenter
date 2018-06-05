import { writeFileSync } from 'fs';
import { GherkinEngine, IGherkinEngineConfig } from './GherkinEngine';
import { IGherkinMethods } from './types';

export function GherkinTest ({ feature }: IGherkinEngineConfig, methodsSetup: (t: IGherkinMethods) => void) {
  const { builder, ast, methods } = GherkinEngine({ feature, stackIndex: 3 });

  console.dir(ast, { depth: 10, colors: true });

  writeFileSync('./ast.json', JSON.stringify(ast, null, 2));

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
