import * as errorParser from 'error-stack-parser';
import * as Gherkin from 'gherkin';
import * as isValidPath from 'is-valid-path';
import { isAbsolute, toUnix } from 'upath';

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

/** Parses a feature file from a relative filePath */
export function parseFeature ({ feature, stackIndex = 1 }: IGherkinParserConfig): IGherkinParserOutput {
  const text = (() => {
    // Is a feature file body
    if (!isValidPath(feature)) { return feature; }

    const filePath = toUnix(feature);

    const testFilePath = (() => {
      if (isAbsolute(feature)) { return; }

      const error = new Error();
      /** Increment stackIndex due to the nested IIFE's it's within */
      return errorParser.parse(error)[stackIndex + 2].fileName;
    })();

    return readInputFile({ filePath, testFilePath });
  })();

  const parser = new Gherkin.Parser();
  const ast: IGherkinAst = parser.parse(text);

  const featureBuilder = new FeatureBuilder(ast);

  return { ast, text, featureBuilder };
}
