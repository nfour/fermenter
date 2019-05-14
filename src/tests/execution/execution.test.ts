import { resolve } from 'path';

import { executeTest } from '../lib';

describe('Fermenter execution matching snapshots', () => {
  it('failingStepTest', async () => {
    const output = await executeTest(resolve(__dirname, './failingStepTest.ts'));

    expect(output).toMatchSnapshot();
  });

  it('skippingStepTest', async () => {
    const output = await executeTest(resolve(__dirname, './skippingStepTest.ts'));

    expect(output).not.toMatch(/this test should be skipped/);
    expect(output).toMatch(/2 skipped, 4 passed, 6 total/);
  });
});
