export function readInputFile ({ filePath, testFilePath }: { filePath: string, testFilePath?: string }) {
  const { dirname, isAbsolute, resolve } = require('path');
  const { readFileSync } = require('fs');

  if (isAbsolute(filePath)) {
    return readFileSync(filePath, 'utf8');
  } else {
    const testDirectory = dirname(testFilePath!);

    return readFileSync(resolve(testDirectory, filePath), 'utf8');
  }
}
