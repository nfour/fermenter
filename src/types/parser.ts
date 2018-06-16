import {
  IBackgroundFluid, IFluidFnCallback, IGherkinAstScenario, IGherkinAstScenarioOutline,
  IScenarioFluid, IScenarioOutlineFluid, Omit,
} from '.';
import { IGherkinAstBackground, IGherkinAstEntity, IGherkinAstExamples, IGherkinAstFeature, IGherkinAstStep } from './ast';

// tslint:disable-next-line

export interface IGherkinFeatureMappings<Ge = any> {
  match: IMatch;
  gherkin: Ge;
}

export interface IScenarioBuilder<
  S extends IGherkinScenario | IGherkinScenarioOutline = IGherkinScenario
> {
  steps: IScenarioFluid;
  scenario: S;
}

export interface IBackgroundBuilder {
  steps: IBackgroundFluid;
  background: IGherkinBackground;
}

/**
 * Produces a subset ScenarioOutline that looks like this:
 * @example { Given, When, Then, Examples: { operations } }
 */
export interface IScenarioOutlineBuilder {
  steps: IScenarioOutlineFluid;

  scenarioOutline: IGherkinScenarioOutline;
}

export type IMatch = string | RegExp;

export type IGherkinCollectionItemShape = IGherkinAstEntity | IGherkinAstStep;
export type IGherkinOperationStore<
  G extends IGherkinCollectionItemShape= IGherkinCollectionItemShape
> = Map<IMatch, {
  fn: IFluidFnCallback,
  gherkin: G;
}>;

export interface IGherkinScenarioBase {
  match: IMatch;
  Given?: IGherkinOperationStore<IGherkinAstStep>;
  When?: IGherkinOperationStore<IGherkinAstStep>;
  Then?: IGherkinOperationStore<IGherkinAstStep>;
}

export interface IGherkinScenario extends IGherkinScenarioBase {
  gherkin: IGherkinAstScenario;
}

export interface IGherkinScenarioOutline extends IGherkinScenarioBase {
  gherkin: IGherkinAstScenarioOutline;
  Examples: IGherkinOperationStore<IGherkinAstExamples>;
}

export interface IGherkinBackground {
  match: IMatch;
  gherkin: IGherkinAstBackground;
  Given: IGherkinOperationStore<IGherkinAstStep>;
}

export interface IGherkinFeature {
  gherkin: IGherkinAstFeature;

  Background?: IGherkinBackground;
  Scenarios: Map<IMatch, IGherkinScenario>;
  ScenarioOutlines: Map<IMatch, IGherkinScenarioOutline>;
}
