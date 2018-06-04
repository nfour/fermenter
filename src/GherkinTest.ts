import { GherkinEngine, IGherkinEngineConfig, IGherkinFluid } from './GherkinEngine';

export function GherkinTest ({ feature }: IGherkinEngineConfig, fn: (t: IGherkinFluid) => void) {
  const t = GherkinEngine({ feature, stackIndex: 3 });

  return test('test', async () => {
    await fn(t);
  });
}
