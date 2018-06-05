import { IBackgroundFluid, IFluidFnCallback, IScenarioFluid, IScenarioOutlineFluid } from '.';

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

export interface IGherkinScenario {
  match: IMatch;

  Given?: IGherkinOperations;
  When?: IGherkinOperations;
  Then?: IGherkinOperations;
}

export interface IGherkinScenarioOutline extends IGherkinScenario {
  Examples: IGherkinOperations; // TODO: may need remediated structure
}

export interface IGherkinBackground {
  match: IMatch;
  Given: IGherkinOperations;
}

export interface IGherkinFeature {
  Background?: IGherkinBackground;
  Scenarios: Map<IMatch, IGherkinScenario>;
  ScenarioOutlines: Map<IMatch, IGherkinScenarioOutline>;
}
