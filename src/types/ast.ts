
export interface IGherkinAst {
  type: 'GherkinDocument';
  feature: IGherkinAstFeature;
  comments: IGherkinAstComment[];
}

export interface IGherkinAstLocation {
  line: number;
  column: number;
}

export interface IGherkinAstFeature extends IGherkinAstEntity {
  type: 'Feature';
  language: string;
  children: IGherkinAstCollections[];
}

export type IGherkinAstCollections = (
  IGherkinAstExamples | IGherkinAstBackground |
  IGherkinAstScenarioOutline | IGherkinAstScenario |
  IGherkinAstStep
);

export interface IGherkinAstComment {
  type: 'Comment';
  location: IGherkinAstLocation;
  text: string;
}

export interface IGherkinAstTag {
  type: 'Tag';
  name: string;
  location: IGherkinAstLocation;
}

export interface IGherkinAstDocString {
  type: 'DocString';
  location: IGherkinAstLocation;
  content: string;
}

export interface IGherkinAstDataTable {
  type: 'DataTable';
  location: IGherkinAstLocation;
  rows: IGherkinAstTableRow[];
}

export interface IGherkinAstEntity {
  tags?: IGherkinAstTag[];
  location: IGherkinAstLocation;
  keyword: string;
  name: string;
  description?: string;
}

export interface IGherkinAstBackground extends IGherkinAstEntity {
  type: 'Background';
  steps: IGherkinAstStep[];
}

export interface IGherkinAstScenarioOutline extends IGherkinAstEntity {
  type: 'ScenarioOutline';
  steps: IGherkinAstStep[];
  examples: IGherkinAstExamples[];
}

export interface IGherkinAstScenario extends IGherkinAstEntity {
  type: 'Scenario';
  steps: IGherkinAstStep[];
}

export interface IGherkinAstStep {
  type: 'Step';
  location: IGherkinAstLocation;
  keyword: string;
  text: string;
  argument: undefined | IGherkinAstDocString | IGherkinAstDataTable;
}

export interface IGherkinAstExamples extends IGherkinAstEntity {
  type: 'Examples';
  tableHeader: IGherkinAstTableRow;
  tableBody: IGherkinAstTableRow;
}

export interface IGherkinAstTableRow {
  type: 'TableRow';
  location: IGherkinAstLocation;
  cells: IGherkinAstTableCell[];
}

export interface IGherkinAstTableCell {
  type: 'TableCell';
  location: IGherkinAstLocation;
  value: string;
}
