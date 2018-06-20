import { IGherkinAstTableRow, IGherkinTableParam } from '../types';

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
export function GherkinTableReader ({ rows: inputRows = [] }: {
  rows: IGherkinAstTableRow[],
}): IGherkinTableParam {
  const rowValues = inputRows
    .map(({ cells }) => cells.map(({ value }) => value));

  const getLeft = () => rowValues.map((cells) => cells[0]);
  const getTop = () => rowValues[0];

  const dict = <IGherkinTableParam['dict']> (() => {
    const keys = headers();

    const contentRows = rowValues.slice(1);

    const tuples = keys.map((key, index): [string, string[]] => {
      return [
        key,
        contentRows.map((cells) => cells[index]),
      ];
    });

    return new Map(tuples);
  });

  dict.left = () => {
    const keys = rowValues.map((cells) => cells[0]);

    const mapTuples = rowValues.map((cells, index): [string, string[]] => {
      /** The cells, after the left-most */
      const contentCells = cells.slice(1);

      return [keys[index], contentCells];
    });

    return new Map(mapTuples);
  };

  dict.matrix = () => {
    const topKeys = getTop()
      .slice(1); // Skip blank

    const leftKeys = getLeft()
      .slice(1); // Skip blank

    const contentRows = rowValues
      .slice(1) // Skip top
      .map((cells) => cells.slice(1)); // Skip left

    const leftTuples = leftKeys.map((leftKey, leftIndex): [string, Map<string, string>] => {
      const topTuples = topKeys.map((topKey, topIndex): [string, string] => {
        const cells = contentRows[topIndex];

        return [topKey, cells[leftIndex]];
      });

      return [leftKey, new Map(topTuples)];
    });

    return new Map(leftTuples);
  };

  const rows = <IGherkinTableParam['rows']> (() => {
    return inputRows.map(({ cells }) => cells.map(({ value }) => value));
  });

  rows.mapByTop = () => {
    const keys = getTop();

    const contentRows = rowValues.slice(1);

    return contentRows.map((cells) => {
      const tuples = keys.map((key, index): [string, string] => {
        return [key, cells[index]];
      });

      return new Map(tuples);
    });
  };

  const headers = <IGherkinTableParam['headers']> (() => getTop());

  return { dict, headers, rows };
}
