import { resolve } from 'path';

import { executeTest } from '../lib';

jest.setTimeout(10000);

describe('Fermenter execution matching snapshots', () => {
  it('failingStepTest', async () => {
    const output = await executeTest(resolve(__dirname, './failingStepTest.ts'));

    expect(output).toMatchSnapshot();
  });

  it('skippingStepTest', async () => {
    const output = await executeTest(resolve(__dirname, './skippingStepTest.ts'));

    expect(output).toMatchSnapshot();
    expect(output).toMatch(/2 skipped, 4 passed, 6 total/);
  });
});
