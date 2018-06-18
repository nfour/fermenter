import { getStepParameters, IGherkinMatchCollectionParams, matchInGherkinCollection } from './lib';
import {
  IAndFluid, IBackgroundBuilder, IFluidFn, IGherkinAst,
  IGherkinAstBackground, IGherkinAstScenario, IGherkinAstScenarioOutline,
  IGherkinCollectionItemIndex, IGherkinFeature, IGherkinMethods, IGherkinOperationStore,
  IGherkinScenario, IGherkinScenarioOutline, IGivenFluid,
  IMatch, IScenarioBuilder, IScenarioOutlineBuilder, IScenarioOutlineExamplesFluid, IScenarioOutlineFluid, IWhenFluid, Omit,
} from './types';

/**
 * This class populates the `feature` property with
 * a data structure that is mapped to a gherkin feature file.
 *
 * The feature file is built up as Scenario()() etc. are invoked,
 * causing the gherkin AST to be parsed and mapped up to the invoking function.
 */
export class FeatureBuilder {
  feature = <IGherkinFeature> {
    Scenarios: new Map(),
    ScenarioOutlines: new Map(),
  };

  constructor (ast: IGherkinAst) {
    this.feature.gherkin = ast.feature;
  }

  Scenario (): IGherkinMethods['Scenario'] {
    const { gherkin: { children: collection } } = this.feature;

    return (match) => {
      const gherkin = matchInGherkinCollection<IGherkinAstScenario>({
        collection, match,
        matchProperty: 'name',
        type: 'Scenario',
      });

      const { scenario, steps } = ScenarioFluidBuilder<IGherkinScenario>(match, gherkin);

      this.feature.Scenarios.set(match, scenario);

      return steps;
    };
  }

  ScenarioOutline (): IGherkinMethods['ScenarioOutline'] {
    const { gherkin: { children: collection } } = this.feature;

    return (match) => {
      const gherkin = matchInGherkinCollection<IGherkinAstScenarioOutline>({
        collection, match,
        matchProperty: 'name',
        type: 'ScenarioOutline',
      });

      const { scenarioOutline, steps } = ScenarioOutlineFluidBuilder(match, gherkin);

      this.feature.ScenarioOutlines.set(match, scenarioOutline);

      return steps;
    };
  }

  Background (): IGherkinMethods['Background'] {
    const { gherkin: { children: collection } } = this.feature;

    return (match = '') => {
      const gherkin = matchInGherkinCollection<IGherkinAstBackground>({
        collection, match,
        matchProperty: 'name',
        type: 'Background',
      });

      const { background, steps } = BackgroundFluidBuilder(match, gherkin);

      this.feature.Background = background;

      return steps;
    };
  }
}

function FluidFn <R> ({ fluid, collectionParams, store }: {
  fluid: R,
  store: IGherkinOperationStore,
  collectionParams: Omit<IGherkinMatchCollectionParams, 'match'>,
}): IFluidFn<R> {
  return (match, fn) => {
    const gherkin: IGherkinCollectionItemIndex = matchInGherkinCollection({
      match,
      ...collectionParams,
    });

    store.set(match, {
      fn,
      name: gherkin[collectionParams.matchProperty],
      gherkin,
      params: getStepParameters(gherkin, match),
    });

    return fluid;
  };
}

function ScenarioFluidBuilder<
  G extends IGherkinScenario | IGherkinScenarioOutline
> (match: IMatch, gherkin: G['gherkin']): IScenarioBuilder<G> {
  const { steps: collection } = gherkin;

  const scenario = <IScenarioBuilder<G>['scenario']> {
    match, gherkin,
    name: gherkin.name,
    Given: new Map(),
    Then: new Map(),
    When: new Map(),
  };

  const thenFluid = <IAndFluid> {};
  const Then = FluidFn({
    fluid: thenFluid,
    store: scenario.Then!,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  const whenFluid = <IWhenFluid> { Then };
  const When = FluidFn({
    fluid: whenFluid,
    store: scenario.When!,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  const givenFluid = <IGivenFluid> { Then, When };
  const Given = FluidFn({
    fluid: givenFluid,
    store: scenario.Given!,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  // Apply conjuctions via mutation
  thenFluid.And = Then;
  whenFluid.And = When;
  givenFluid.And = Given;

  return {
    scenario,
    steps: { Given, Then, When },
  };
}

function ScenarioOutlineFluidBuilder (match: IMatch, gherkin: IGherkinAstScenarioOutline): IScenarioOutlineBuilder {
  const { scenario, steps: { Given, When } } = ScenarioFluidBuilder<IGherkinScenarioOutline>(match, gherkin);

  const scenarioOutline: IScenarioOutlineBuilder['scenarioOutline'] = {
    ...scenario,
    Examples: new Map(),
  };

  const steps = <IScenarioOutlineFluid> { Given, When };
  const { examples, steps: collection } = gherkin;

  const Examples = FluidFn({
    fluid: steps,
    store: scenarioOutline.Examples,
    collectionParams: { collection: examples, matchProperty: 'name', type: 'Examples' },
  });

  const thenFluid = <IScenarioOutlineExamplesFluid & IAndFluid> { Examples };
  const Then = FluidFn({
    fluid: thenFluid,
    store: scenarioOutline.Then!,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  thenFluid.And = Then;

  return {
    scenarioOutline,
    steps: { Given, When, Then, Examples },
  };
}

function BackgroundFluidBuilder (match: IMatch, gherkin: IGherkinAstBackground): IBackgroundBuilder {
  const { steps: collection } = gherkin;

  const background: IBackgroundBuilder['background'] = {
    gherkin, match,
    name: gherkin.name,
    Given: new Map(),
  };

  const givenFluid = <IGivenFluid> {};
  const Given = FluidFn({
    fluid: givenFluid,
    store: background.Given,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  givenFluid.And = Given;

  return {
    background,
    steps: { Given },
  };
}
