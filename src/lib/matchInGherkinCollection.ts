import * as c from 'colors';
import { IGherkinAstCollections, IGherkinCollectionItemIndex, IMatch } from '../types';
import { ExpressionMatcher } from './ExpressionMatcher';

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

export function matchGherkinText (subject: string, match: IMatch): boolean {
  const matcher = ExpressionMatcher(match);

  return !!(subject.match(matcher.regexp) || []).length;
}
