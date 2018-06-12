import { IBackgroundFluid, IFluidFnCallback, IGherkinAstScenario, IGherkinAstScenarioOutline, IScenarioFluid, IScenarioOutlineFluid } from '.';
import { IGherkinAstBackground, IGherkinAstExamples, IGherkinAstFeature } from './ast';

export interface IScenarioBuilderResult {
  steps: IScenarioFluid;
  scenario: IGherkinScenario;
}

export interface IBackgroundBuilderResult {
  steps: IBackgroundFluid;
  background: IGherkinBackground;
}

export interface IScenarioOutlineBuilderResult {
  steps: IScenarioOutlineFluid;
  scenarioOutline: IGherkinScenarioOutline;
}

export type IMatch = string | RegExp;

export type IGherkinOperations = Map<IMatch, IFluidFnCallback>;

export interface IGherkinScenarioBase {
  match: IMatch;
  Given?: IGherkinOperations;
  When?: IGherkinOperations;
  Then?: IGherkinOperations;
}

export interface IGherkinScenario extends IGherkinScenarioBase {
  gherkin: IGherkinAstScenario;
}

export interface IGherkinScenarioOutline extends IGherkinScenarioBase {
  gherkin: IGherkinAstScenarioOutline;
  Examples: IGherkinExamples;
}

export interface IGherkinExamples {
  match: IMatch;
  gherkin: IGherkinAstExamples;
}

export interface IGherkinBackground {
  match: IMatch;
  gherkin: IGherkinAstBackground;
  Given: IGherkinOperations;
}

export interface IGherkinFeature {
  gherkin: IGherkinAstFeature;

  Background?: IGherkinBackground;
  Scenarios: Map<IMatch, IGherkinScenario>;
  ScenarioOutlines: Map<IMatch, IGherkinScenarioOutline>;
}
