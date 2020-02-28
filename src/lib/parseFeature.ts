import * as errorParser from 'error-stack-parser';
import * as Gherkin from 'gherkin';
import * as isValidPath from 'is-valid-path';
import { toUnix } from 'upath';

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
export function parseFeature ({ feature, stackIndex = 1 }: IGherkinParserConfig): IGherkinParserOutput {
  const error = new Error();
  const { fileName: testFilePath } = errorParser.parse(error)[stackIndex];

  const text = (() => {
    if (!isValidPath(feature)) { return feature; }

    const filePath = toUnix(feature);

    return readInputFile({ filePath, testFilePath });
  })();

  const parser = new Gherkin.Parser();
  const ast: IGherkinAst = parser.parse(text);

  const featureBuilder = new FeatureBuilder(ast);

  return { ast, text, featureBuilder };
}
