import { shell } from 'execa';
import { resolve } from 'path';

it('should execute the test as expected', async () => {
  const cwd = resolve(__dirname, '../../..');
  const testPath = resolve(__dirname, './executionGherkinTest.ts');
  const { stderr } = await shell(
    `yarn jest --testRegex ".*Test.ts$" --runTestsByPath ${testPath}`,
    { cwd, reject: false },
  );

  /** Remove parts that can change between snapshots */
  const output = stderr
    .split('\n').slice(0, -5).join('\n')
    .replace(/\s*\(\dms\)/g, '');

  expect(output).toMatchSnapshot();

});
