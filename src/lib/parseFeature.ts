import * as Gherkin from 'gherkin';
import * as isValidPath from 'is-valid-path';

import { FeatureBuilder } from '../FeatureBuilder';
import { IGherkinAst } from '../types';
import { readInputFile } from './readInputFile';

export interface IGherkinParserOutput {
  ast: IGherkinAst;
  text: string;
  featureBuilder: FeatureBuilder;
}

export interface IGherkinParserConfig {
  feature: string;
  stackIndex?: number;
}

// TODO: make this pure functional, abstract the error stack relative shit out
/** Parses a feature file from a relative filePath */
export function parseFeature ({ feature, stackIndex = 2 }: IGherkinParserConfig): IGherkinParserOutput {
  const testFilePath = new Error().stack!
    .split('\n')[stackIndex]
    .match(/\(([^:]+):/ig)![0]
    .replace(/^\(|:$/g, '');

  const text = isValidPath(feature)
    ? readInputFile({ filePath: feature, testFilePath })
    : feature;

  const parser = new Gherkin.Parser();
  const ast: IGherkinAst = parser.parse(text);

  const featureBuilder = new FeatureBuilder(ast);

  return { ast, text, featureBuilder };
}
