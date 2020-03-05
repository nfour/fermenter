import { resolve } from 'path';

import { executeTest } from '../lib';

jest.setTimeout(10000);

describe('Middleware hook tests', () => {
  it('middlewareHookTest', async () => {
    const output = await executeTest(resolve(__dirname, './middlewareHookTest.ts'));

    expect(output).toMatchSnapshot();
  });
});
