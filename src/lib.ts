import * as c from 'colors';
import { readFileSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { IGherkinAstCollections, IGherkinCollectionItemIndex, IMatch } from './types';

export function readInputFile ({ filePath, testFilePath }: { filePath: string, testFilePath?: string }) {
  if (isAbsolute(filePath)) {
    return readFileSync(filePath, 'utf8');
  } else {
    const testDirectory = dirname(testFilePath!);

    return readFileSync(resolve(testDirectory, filePath), 'utf8');
  }
}

export interface IGherkinMatchCollectionParams {
  type: IGherkinAstCollections['type'];
  match: IMatch;
  collection: IGherkinAstCollections[];
  matchProperty: 'name' | 'text';
}

export function matchInGherkinCollection<
  In extends IGherkinAstCollections = IGherkinAstCollections
> ({ type, match, collection, matchProperty }: IGherkinMatchCollectionParams): In {
  const filteredByType = <IGherkinCollectionItemIndex[]> collection
    .filter((child) => child.type === type);

  const matchingChild = filteredByType
    .find((child) => matchGherkinText(child[matchProperty], match));

  if (!matchingChild) {
    throw new Error([
      `Couldn't find a match for ${c.cyan(type)} expression:`,
      `  ${c.red(match.toString())}`,
      `Possible matches:`,
      ...filteredByType.map((child) => `  ${c.yellow(child[matchProperty])}`),
      '',
    ].join('\n'));
  }

  return matchingChild as In;
}

export function matchGherkinText (subject: string, match: IMatch) {
  // TODO: use expression parser here?

  return !!(subject.match(match) || []).length;
}
