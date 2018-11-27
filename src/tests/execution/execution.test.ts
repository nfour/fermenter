import { shell } from 'execa';
import { resolve } from 'path';

async function executeTest (filePath: string) {
  const cwd = resolve(__dirname, '../../..');
  const testPath = resolve(__dirname, filePath);

  const { stderr, stdout } = await shell(
    `yarn jest --verbose --testRegex . --runTestsByPath ${testPath}`,
    { cwd, reject: false },
  );

  const stripColorsRe = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

  /** Remove parts that can change between snapshots */
  return `${stdout}${stderr}`
    .replace(/\s*\(\dms\)/g, '')
    .replace(stripColorsRe, '');
}

describe('Fermenter execution matching snapshots', () => {
  it('failingStepTest', async () => {
    const output = await executeTest('./failingStepTest.ts');

    const selectedOutput = output
      .slice(
        output.indexOf('FAIL'),
        output.lastIndexOf('Test Suites'),
      );

    expect(selectedOutput).toMatchSnapshot();
  });

  it('skippingStepTest', async () => {
    const output = await executeTest('./skippingStepTest.ts');

    expect(output).toMatch(/Tests:\s+2 skipped, 2 total/);
  });

});
