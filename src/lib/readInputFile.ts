declare const __non_webpack_require__: any;
declare const __webpack_require__: any;

export function readInputFile ({ filePath, testFilePath = '' }: { filePath: string, testFilePath?: string }) {
  const dRequire: typeof require = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

  const { dirname, isAbsolute, resolve }: typeof import ('upath') = dRequire('upath');
  const { readFileSync }: typeof import ('fs') = dRequire('fs');

  if (isAbsolute(filePath)) {
    return readFileSync(filePath, 'utf8');
  }

  const testDirectory = testFilePath && dirname(testFilePath);
  const finalPath = resolve(testDirectory, filePath);

  return readFileSync(finalPath, 'utf8');
}
