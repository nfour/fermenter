import {
  IAndFluid, IBackgroundBuilderResult, IFluidFn, IGherkinAst,
  IGherkinBackground, IGherkinFeature, IGherkinMethods, IGherkinOperations,
  IGherkinScenario, IGherkinScenarioOutline, IGivenFluid, IMatch, IScenarioBuilderResult,
  IScenarioOutlineBuilderResult, IScenarioOutlineExamplesFluid, IScenarioOutlineFluid, IWhenFluid,
} from './types';

// FIXME: fix everything here to conform to new types
export class FeatureBuilder {
  feature: IGherkinFeature = {
    Scenarios: new Map(),
    ScenarioOutlines: new Map(),
  };

  constructor (private ast: IGherkinAst) {
    this.ast = ast;
  }

  Scenario (): IGherkinMethods['Scenario'] {
    return (match) => {
      const { scenario, steps } = ScenarioFluidBuilder(match);

      this.feature.Scenarios.set(scenario.match, scenario);

      return steps;
    };
  }

  ScenarioOutline (): IGherkinMethods['ScenarioOutline'] {
    return (match) => {
      const { scenarioOutline, steps } = ScenarioOutlineFluidBuilder(match);

      this.feature.ScenarioOutlines.set(scenarioOutline.match, scenarioOutline);

      return steps;
    };
  }

  Background (): IGherkinMethods['Background'] {
    return (match = '') => {
      const { background, steps } = BackgroundFluidBuilder(match);

      this.feature.Background = background;

      return steps;
    };
  }
}

// FIXME: document this
const FluidFn = <R>(fluid: R, store: IGherkinOperations): IFluidFn<R> =>
  (match, fn) => {
    store.set(match, fn);

    return fluid;
  };

function ScenarioFluidBuilder (scenarioMatch: IMatch): IScenarioBuilderResult {
  const scenario: Required<IGherkinScenario> = {
    match: scenarioMatch,
    Given: new Map(),
    Then: new Map(),
    When: new Map(),
  };

  const thenFluid = <IAndFluid> {};
  const Then = FluidFn(thenFluid, scenario.Then);

  const whenFluid = <IWhenFluid> { Then };
  const When = FluidFn(whenFluid, scenario.When);

  const givenFluid = <IGivenFluid> { Then, When };
  const Given = FluidFn(givenFluid, scenario.Given);

  // Apply conjuctions via mutation
  thenFluid.And = Then;
  whenFluid.And = When;
  givenFluid.And = Given;

  return {
    scenario,
    steps: { Given, Then, When },
  };
}

function BackgroundFluidBuilder (match: IMatch): IBackgroundBuilderResult {
  const background: Required<IGherkinBackground> = {
    match,
    Given: new Map(),
  };

  const givenFluid = <IGivenFluid> {};
  const Given = FluidFn(givenFluid, background.Given);
  givenFluid.And = Given;

  return {
    background,
    steps: { Given },
  };
}

function ScenarioOutlineFluidBuilder (match: IMatch): IScenarioOutlineBuilderResult {
  const { scenario, steps: { Given, When } } = ScenarioFluidBuilder(match);

  const scenarioOutline = <IGherkinScenarioOutline> {
    ...scenario,
    Examples: new Map(),
  };

  const steps = <IScenarioOutlineFluid> { Given, When };

  const Examples = FluidFn(steps, scenarioOutline.Examples);

  const thenFluid = <IScenarioOutlineExamplesFluid & IAndFluid> { Examples };
  const Then = FluidFn(thenFluid, scenarioOutline.Then!);

  thenFluid.And = Then;

  return {
    scenarioOutline,
    steps: { Given, When, Then, Examples },
  };
}
