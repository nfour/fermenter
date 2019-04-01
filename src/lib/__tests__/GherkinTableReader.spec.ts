import { IGherkinAstTableCell, IGherkinAstTableRow } from '../../types';
import { GherkinTableReader } from '../GherkinTableReader';

function structureAsGherkinAstRows (rows: string[][]): IGherkinAstTableRow[] {
  return rows.map((cells): IGherkinAstTableRow => {
    return {
      type: 'TableRow',
      location: {} as any,
      cells: cells.map((value): IGherkinAstTableCell => {
        return {
          location: {} as any,
          type: 'TableCell',
          value,
        };
      }),
    };
  });
}

function rowsToGherkinTableLines (rows: string[][]): string[] {
  return rows.map((cells) => `| ${cells.join(' | ')} |`);
}

describe('GherkinTableReader', () => {

  const simpleContentTable = [
    ['1', '2'],
    ['3', '4'],
  ];

  const topHeaderTable = [
    ['a', 'b'],
    ['1', '3'],
    ['2', '4'],
  ];

  const leftHeaderTable = [
    ['a', '1', '2'],
    ['b', '3', '4'],
  ];

  const matrixTable = [
    [' ', 'x', 'y'],
    ['a', '1', '2'],
    ['b', '3', '4'],
  ];

  const matrixTableAsymmetric = [
    [' ', 'x', 'y'],
    ['a', '1', '2'],
    ['b', '3', '4'],
    ['c', '5', '6'],
    ['d', '7', '8'],
  ];

  it([
    `table.rows() from a headerless table:`,
    ...rowsToGherkinTableLines(simpleContentTable),
    ``,
  ].join('\n'), () => {
    const table = GherkinTableReader({ rows: structureAsGherkinAstRows(simpleContentTable) });

    expect(table.rows()).toMatchSnapshot();
  });

  it([
    `table.rows.mapByTop() from a table with a header:`,
    ...rowsToGherkinTableLines(topHeaderTable),
    ``,
  ].join('\n'), () => {
    const table = GherkinTableReader({ rows: structureAsGherkinAstRows(topHeaderTable) });

    expect(table.rows.mapByTop()).toMatchSnapshot();
  });

  it([
    `table.dict() from a table with a header:`,
    ...rowsToGherkinTableLines(topHeaderTable),
    ``,
  ].join('\n'), () => {
    const table = GherkinTableReader({ rows: structureAsGherkinAstRows(topHeaderTable) });

    expect(table.dict()).toMatchSnapshot();
  });

  it([
    `table.dict() from a headerless table:`,
    ...rowsToGherkinTableLines(simpleContentTable),
    ``,
  ].join('\n'), () => {
    const table = GherkinTableReader({ rows: structureAsGherkinAstRows(simpleContentTable) });

    expect(table.dict()).toMatchSnapshot();
  });

  it([
    `table.dict.left() from a table with a header on the left:`,
    ...rowsToGherkinTableLines(leftHeaderTable),
    ``,
  ].join('\n'), () => {
    const table = GherkinTableReader({ rows: structureAsGherkinAstRows(leftHeaderTable) });

    expect(table.dict.left()).toMatchSnapshot();
  });

  it([
    `table.dict.matrix() from a table with a header on the left and the top:`,
    ...rowsToGherkinTableLines(matrixTable),
    ``,
  ].join('\n'), () => {
    const table = GherkinTableReader({ rows: structureAsGherkinAstRows(matrixTable) });

    expect(table.dict.matrix()).toMatchSnapshot();
  });

  it([
    `table.dict.matrix() with asymmetric top and left keys:`,
    ...rowsToGherkinTableLines(matrixTableAsymmetric),
    ``,
  ].join('\n'), () => {
    const table = GherkinTableReader({ rows: structureAsGherkinAstRows(matrixTableAsymmetric) });

    expect(table.dict.matrix()).toMatchSnapshot();
  });
});
