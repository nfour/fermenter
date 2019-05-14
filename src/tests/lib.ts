import { shell } from 'execa';
import { resolve } from 'path';

const cwd = resolve(__dirname, '../../');

/** All lines which match get removed from the generated output */
const lineFilters: Array<(line: string) => boolean> = [
  (line) => !/^Time:/.test(line),
  (line) => !/^Ran all test suites within paths/.test(line),
  (line) => !/^Snapshots:/.test(line),
  (line) => !/^\$ \//.test(line),
];

export async function executeTest (testPath: string) {
  const { stderr, stdout } = await shell(
    `yarn --silent jest --verbose --testRegex . --runTestsByPath ${testPath}`,
    { cwd, reject: false },
  );

  const stripColorsRe = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

  /** Remove parts that can change between snapshots */
  const lines = `${stdout}${stderr}`
    .replace(stripColorsRe, '') // Remove color characters
    .replace(/\s*\(\dms\)/g, '') // Remove test timings: eg. (1ms)
    .split('\n')
    .filter((line) => lineFilters.every((fn) => fn(line)));

  return lines.join('\n');
}
