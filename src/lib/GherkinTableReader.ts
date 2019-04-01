import { IDict, IGherkinAstTableRow, ITable } from '../types';

/**
 * A gherkin feature file's table:
 *
 *   | a | b |
 *   | 1 | 2 |
 *
 * Becomes `IGherkinAstTableRows[]`
 *
 * @example
 *
 * const table = GherkinTableReader({ rows });
 * table.dict();
 */
export function GherkinTableReader ({ rows: inputRows = [] }: {
  rows: IGherkinAstTableRow[],
}): ITable {
  const rowValues = inputRows
    .map(({ cells }) => cells.map(({ value }) => value));

  const getLeft = () => rowValues.map((cells) => cells[0]);
  const getTop = () => rowValues[0];

  const headers = <ITable['headers']> (() => getTop());

  const dict = <ITable['dict']> (() => {
    const keys = headers();

    const contentRows = rowValues.slice(1);

    return keys.reduce((o, key, index) => {
      return {
        ...o,
        [key]: contentRows.map((cells) => cells[index]),
      };
    }, {} as IDict<string[]>);
  });

  dict.left = <ITable['dict']['left']> (() => {
    const keys = rowValues.map((cells) => cells[0]);

    return rowValues.reduce((o, cells, index) => {
      /** The cells, after the left-most */
      const contentCells = cells.slice(1);

      return {
        ...o,
        [keys[index]]: contentCells,
      };
    }, {} as IDict<string[]>);
  });

  dict.matrix = <ITable['dict']['matrix']> (() => {
    const topKeys = getTop()
      .slice(1); // Skip blank

    const leftKeys = getLeft()
      .slice(1); // Skip blank

    const contentRows = rowValues
      .slice(1) // Skip top
      .map((cells) => cells.slice(1)); // Skip left

    return leftKeys.reduce((l, leftKey, leftIndex) => {
      const topMap = topKeys.reduce((t, topKey, topIndex) => {
        const cells = contentRows[leftIndex];

        return {
          ...t,
          [topKey]: cells[topIndex],
        };
      }, {} as IDict<string>);

      return {
        ...l,
        [leftKey]: topMap,
      };
    }, {} as IDict<IDict<string>>);
  });

  const rows = <ITable['rows']> (() => rowValues);

  rows.mapByTop = <ITable['rows']['mapByTop']> ((): any => {
    const keys = getTop();

    const contentRows = rowValues.slice(1);

    return contentRows.map((cells) => {
      return keys.reduce((o, key, index) => {
        return {
          ...o,
          [key]: cells[index],
        };
      }, {} as IDict<string>);
    });
  });

  return { dict, headers, rows };
}
