import { IGherkinAstStep, IGherkinAstTableRow, IGherkinTableParam, IMatch } from '../types';
import { ExpressionMatcher } from './ExpressionMatcher';

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
    return createGherkinTable(argument.rows);
  }

  if (argument.type === 'DocString') {
    return argument.content;
  }
}

function createGherkinTable ({ rows: inputRows }: {
  rows: IGherkinAstTableRow[],
}): IGherkinTableParam {

  const dict = <IGherkinTableParam['dict']> (() => {
    return ;
  });

  dict.byLeft = () => {
    const indexCells = inputRows.map((row) => row.cells[0].value);

    const mapTuples = inputRows.map((row, index) => {
      return [row.];
    });
  };

  dict.byTop = () => {

  };

  const rows = <IGherkinTableParam['rows']> (() => {

  });

  const headers = <IGherkinTableParam['headers']> (() => {

  });

  return {
    dict,
    headers,
    rows,
  };
}
