import { resolve } from 'path';

import { executeTest } from '../lib';

describe('Middleware hook tests', () => {
  it('middlewareHookTest', async () => {
    const output = await executeTest(resolve(__dirname, './middlewareHookTest.ts'));

    expect(output).toMatchSnapshot();
  });
});
