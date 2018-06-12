import { readFileSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { IGherkinAstChildren, IMatch } from './types';

export function readInputFile ({ filePath, testFilePath }: { filePath: string, testFilePath?: string }) {
  if (isAbsolute(filePath)) {
    return readFileSync(filePath, 'utf8');
  } else {
    const testDirectory = dirname(testFilePath!);

    return readFileSync(resolve(testDirectory, filePath), 'utf8');
  }
}

export function matchInGherkinChildren<
  In extends IGherkinAstChildren = IGherkinAstChildren
> ({ type, match, children }: {
  type: IGherkinAstChildren['type']
  match: IMatch
  children: IGherkinAstChildren[];
}): In {
  const matchingChild = children
    .filter((child) => child.type === type)
    .find((child) => matchGherkinText(child.name, match));

  if (!matchingChild) {
    throw new Error(`Could not find a match for ${type} ${match} in feature`);
  }

  return matchingChild as In;
}

export function matchGherkinText (subject: string, match: IMatch) {
  // TODO: use expression parser here?

  return !!(subject.match(match) || []).length;
}
