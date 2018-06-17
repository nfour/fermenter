import * as c from 'colors';
import * as expression from 'cucumber-expressions';
import { readFileSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { IGherkinAstCollections, IGherkinCollectionItemIndex, IMatch } from './types';
import { IExpressionMatcher } from './types/matcher';

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

  // TODO: this needs to ALSO filter on `keyword`!

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

function matchGherkinText (subject: string, match: IMatch): boolean {
  const matcher = getExpressionMatcher(match);

  return !!(subject.match(matcher.regexp) || []).length;
}

export function getExpressionMatcher (match: IMatch, registry?: any): IExpressionMatcher {
  if (!registry) {
    registry = new expression.ParameterTypeRegistry();
  }

  return (typeof match === 'string') ?
    new expression.CucumberExpression(match, registry) :
    new expression.RegularExpression(match, registry);
}
