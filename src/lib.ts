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

  const matchingChild = filteredByType
    .map((child) => (<IGherkinCollectionItemIndex> {
      ...child,
      argument: matchGherkinText(child[matchProperty], match),
    }))
    .find((child) => !!child.argument);

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

/**
 * Match and returns arguments based on expression
 */
function matchGherkinText (subject: string, match: IMatch): any[]|undefined {
  const registry = new expression.ParameterTypeRegistry();

  const matcher: IExpressionMatcher = (typeof match === 'string') ?
    new expression.CucumberExpression(match, registry) :
    new expression.RegularExpression(match, registry);

  const args = matcher.match(subject);

  if (args) {
    return args.map((arg) => arg.getValue());
  }

  return;
}
