import { FeatureBuilder } from './FeatureBuilder';
import { IGherkinAst, IMatch } from './types';

export function executeFeature ({ featureBuilder, ast }: {
  featureBuilder: FeatureBuilder;
  ast: IGherkinAst;
}) {
  const reader = new GherkinAstReader(ast);

  reader.getScenario();
}

class GherkinAstReader {
  constructor (
    public ast: IGherkinAst,
  ) {
    this.ast = ast;
  }

  getScenario (match: IMatch) {

  }
}
