import { IGherkinAstStep, IMatch } from '../types';
import { ExpressionMatcher } from './ExpressionMatcher';
import { GherkinTableReader } from './GherkinTableReader';

export function parseStepParameters (step: IGherkinAstStep, match: IMatch) {
  const { argument, text } = step;

  const matcher = ExpressionMatcher(match);
  const matches = matcher.match(text) || [];

  const simpleParams = matches.map((arg) => arg.getValue());
  const argumentParam = parseStepArgument(argument);

  const params = argumentParam
    ? [...simpleParams, argumentParam]
    : simpleParams;

  return params;
}

function parseStepArgument (argument: IGherkinAstStep['argument']) {
  if (!argument) { return; }

  if (argument.type === 'DataTable') {
    return GherkinTableReader({ rows: argument.rows });
  }

  if (argument.type === 'DocString') {
    return argument.content;
  }
}
