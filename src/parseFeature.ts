import * as Gherkin from 'gherkin';
import { FeatureBuilder } from './FeatureBuilder';
import { readInputFile } from './lib/readInputFile';
import { IGherkinAst } from './types';

export interface IGherkinParserOutput {
  ast: IGherkinAst;
  text: string;
  featureBuilder: FeatureBuilder;
}

export interface IGherkinParserConfig {
  feature: string;
  stackIndex?: number;
}

/** Parses a feature file from a relative filePath */
export function parseFeature ({ feature, stackIndex = 2 }: Pick<
  IGherkinParserConfig, 'feature' | 'stackIndex'
>): IGherkinParserOutput {
  const testFilePath = new Error().stack!
    .split('\n')[stackIndex]
    .match(/\(([^:]+):/ig)![0]
    .replace(/^\(|:$/g, '');

  const text = readInputFile({ filePath: feature, testFilePath });
  const parser = new Gherkin.Parser();
  const ast: IGherkinAst = parser.parse(text);

  const featureBuilder = new FeatureBuilder(ast);

  return { ast, text, featureBuilder };
}
