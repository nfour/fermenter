import { matchInGherkinChildren } from './lib';
import {
  IAndFluid, IBackgroundBuilderResult, IFluidFn, IGherkinAst,
  IGherkinAstChildren, IGherkinAstFeature, IGherkinAstScenario, IGherkinBackground,
  IGherkinFeature, IGherkinMethods, IGherkinOperations, IGherkinScenario, IGherkinScenarioOutline,
  IGivenFluid, IMatch, IScenarioBuilderResult, IScenarioOutlineBuilderResult, IScenarioOutlineExamplesFluid, IScenarioOutlineFluid, IWhenFluid,
} from './types';

// FIXME: fix everything here to conform to new types
export class FeatureBuilder {
  feature = <IGherkinFeature> {
    Scenarios: new Map(),
    ScenarioOutlines: new Map(),
  };

  constructor (ast: IGherkinAst) {
    this.feature.gherkin = ast.feature;
  }

  Scenario (): IGherkinMethods['Scenario'] {
    const { gherkin: { children } } = this.feature;

    // TODO: so what i SHOULD do is make the FluidBuilder functions return a Partial<> without the gherkin/match props
    // and I should spread those in here instead as they are static props
    // which is nice because suddenly those functions become way dumber
    // cnf rite now tho
    return (match) => {
      const { scenario, steps } = ScenarioFluidBuilder({ match, children });

      this.feature.Scenarios.set(scenario.match, scenario);

      return steps;
    };
  }

  ScenarioOutline (): IGherkinMethods['ScenarioOutline'] {
    const { gherkin: { children } } = this.feature;

    return (match) => {
      const { scenarioOutline, steps } = ScenarioOutlineFluidBuilder({ match, children });

      this.feature.ScenarioOutlines.set(scenarioOutline.match, scenarioOutline);

      return steps;
    };
  }

  Background (): IGherkinMethods['Background'] {
    const { gherkin: { children } } = this.feature;

    return (match = '') => {
      const { background, steps } = BackgroundFluidBuilder({ match, children });

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

function ScenarioFluidBuilder ({ match, children }: {
  match: IMatch
  children: IGherkinAstChildren[],
}): IScenarioBuilderResult {
  const scenario: Required<IGherkinScenario> = {
    match,
    gherkin: matchInGherkinChildren({
      match,
      children,
      type: 'Scenario',
    }),
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

function BackgroundFluidBuilder ({ match, children }: {
  match: IMatch
  children: IGherkinAstChildren[],
}): IBackgroundBuilderResult {
  const background: Required<IGherkinBackground> = {
    match,
    gherkin: matchInGherkinChildren({
      children, match, type: 'Background',
    }),
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

function ScenarioOutlineFluidBuilder ({ match, children }: {
  match: IMatch
  children: IGherkinAstChildren[],
}): IScenarioOutlineBuilderResult {
  // FIXME: I Just realized that because I am composing these functions that I should not
  // be passing in the children - it's basically a side effect - should compute this beforehand :(
  const { scenario, steps: { Given, When } } = ScenarioFluidBuilder({ match, children: [] });

  const scenarioOutline = <IGherkinScenarioOutline> {
    ...scenario,
    gherkin: matchInGherkinChildren({
      children, match,
      type: 'ScenarioOutline',
    }),
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
