declare const __non_webpack_require__: any;
declare const __webpack_require__: any;

export function readInputFile ({ filePath, testFilePath }: { filePath: string, testFilePath?: string }) {
  const dRequire = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

  const { dirname, isAbsolute, resolve } = dRequire('path');
  const { readFileSync } = dRequire('fs');

  if (isAbsolute(filePath)) {
    return readFileSync(filePath, 'utf8');
  } else {
    const testDirectory = dirname(testFilePath!);

    return readFileSync(resolve(testDirectory, filePath), 'utf8');
  }
}
