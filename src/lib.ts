import * as c from 'colors';
import { readFileSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { IGherkinAstCollections, IMatch } from './types';

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
  const matchingChild = collection
    .filter((child) => child.type === type)
    .find((child: any) => matchGherkinText(child[matchProperty], match));

  if (!matchingChild) {
    console.dir(collection);
    throw new Error(`Couldn't find a match for ${c.cyan(type)} '${c.red(match.toString())}'`);
  }

  return matchingChild as In;
}

export function matchGherkinText (subject: string, match: IMatch) {
  // TODO: use expression parser here?

  return !!(subject.match(match) || []).length;
}
