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
    return GherkinTableReader(argument.rows);
  }

  if (argument.type === 'DocString') {
    return argument.content;
  }
}
/**
 * From a feature files rows:
 *
 *   | a | b | c |
 *   | 1 | 2 | 1 |
 *   | 3 | 4 | 3 |
 *
 * which becomes input as `IGherkinAstTableRows[]`
 *
 * @example
 *
 *   const table = GherkinTableReader({ rows })
 *
 *   [ ...table.dict.byTop() ]
 *   === [['a', '1']]
 *
 */
function GherkinTableReader ({ rows: inputRows }: {
  rows: IGherkinAstTableRow[],
}): IGherkinTableParam {

  const dict = <IGherkinTableParam['dict']> (() => {
    return ;
  });

  dict.byLeft = () => {
    const leftCells = inputRows.map((row) => row.cells[0].value);

    const mapTuples = inputRows.map((row, index) => {
      /** The cells, after the left-most */
      const valueCells = row.cells.slice(1)
        .map(({ value }) => value);

      return [leftCells[index], valueCells];
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
