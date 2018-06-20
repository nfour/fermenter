import { IGherkinAstExamples, IGherkinAstStep, IGherkinParameter, IMatch } from '../types';
import { ExpressionMatcher } from './ExpressionMatcher';
import { GherkinTableReader } from './GherkinTableReader';

export function parseGherkinParameters (stepOrExamples: IGherkinAstStep | IGherkinAstExamples, match: IMatch) {
  const text = stepOrExamples.type === 'Step'
    ? stepOrExamples.text
    : stepOrExamples.name;

  const matcher = ExpressionMatcher(match);
  const matches = matcher.match(text) || [];
  const simpleParams = matches.map((arg) => arg.getValue());

  const paramSource = stepOrExamples.type === 'Step'
    ? stepOrExamples.argument
    : stepOrExamples;

  const argumentParam = parseGherkinForParameter(paramSource);

  const params = argumentParam
    ? [...simpleParams, argumentParam]
    : simpleParams;

  return params;
}

function parseGherkinForParameter (arg: IGherkinAstStep['argument'] | IGherkinAstExamples): undefined | IGherkinParameter {
  if (!arg) { return; }

  if (arg.type === 'DataTable') {
    return GherkinTableReader({ rows: arg.rows });
  }

  if (arg.type === 'Examples') {
    const rows = [
      ...arg.tableHeader || [],
      ...arg.tableBody || [],
    ];

    return GherkinTableReader({ rows });
  }

  if (arg.type === 'DocString') {
    return arg.content;
  }
}
