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
 * A gherkin feature file's rows:
 *
 *   | a | b |
 *   | 1 | 2 |
 *   | 3 | 4 |
 *
 * Becomes `IGherkinAstTableRows[]`
 *
 * @example
 *
 * const table = GherkinTableReader({ rows })
 */
function GherkinTableReader ({ rows: inputRows = [] }: {
  rows: IGherkinAstTableRow[],
}): IGherkinTableParam {

  const dict = <IGherkinTableParam['dict']> (() => {
    const keys = headers();

    // TODO: continueeeeeeeeeeeeeeeeeeeeee
    // TODO: continueeeeeeeeeeeeeeeeeeeeee
    // TODO: continueeeeeeeeeeeeeeeeeeeeee
    // TODO: continueeeeeeeeeeeeeeeeeeeeee
    // TODO: continueeeeeeeeeeeeeeeeeeeeee
    // TODO: continueeeeeeeeeeeeeeeeeeeeee
    // TODO: continueeeeeeeeeeeeeeeeeeeeee
  });

  dict.left = () => {
    const keys = inputRows.map((row) => row.cells[0].value);

    const mapTuples = inputRows.map((row, index) => {
      /** The cells, after the left-most */
      const valueCells = row.cells.slice(1)
        .map(({ value }) => value);

      return [keys[index], valueCells];
    });
  };

  const rows = <IGherkinTableParam['rows']> (() => {
    return inputRows.map(({ cells }) => cells.map(({ value }) => value));
  });

  const headers = <IGherkinTableParam['headers']> (() => {
    return inputRows[0].cells.map(({ value }) => value);
  });

  return {
    dict,
    headers,
    rows,
  };
}
