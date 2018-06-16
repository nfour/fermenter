import { IGherkinMatchCollectionParams, matchInGherkinCollection } from './lib';
import {
  IAndFluid, IBackgroundBuilder, IFluidFn, IGherkinAst,
  IGherkinAstBackground, IGherkinAstScenario, IGherkinAstScenarioOutline,
  IGherkinFeature, IGherkinMethods, IGherkinOperationStore, IGivenFluid,
  IScenarioBuilder, IScenarioOutlineBuilder, IScenarioOutlineExamplesFluid,
  IScenarioOutlineFluid, IWhenFluid, Omit,
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
    const { gherkin: { children: collection } } = this.feature;

    return (match) => {
      const gherkin = matchInGherkinCollection<IGherkinAstScenario>({
        collection, match,
        matchProperty: 'name',
        type: 'Scenario',
      });

      const { scenario, steps } = ScenarioFluidBuilder(gherkin);

      this.feature.Scenarios.set(match, {
        match, gherkin,
        ...scenario,
      });

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

      const { scenarioOutline, steps } = ScenarioOutlineFluidBuilder(gherkin);

      this.feature.ScenarioOutlines.set(match, {
        match, gherkin,
        ...scenarioOutline,
      });

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

      const { background, steps } = BackgroundFluidBuilder(gherkin);

      this.feature.Background = {
        gherkin, match,
        ...background,
      };

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
    store.set(match, {
      fn,
      gherkin: matchInGherkinCollection({
        match,
        ...collectionParams,
      }),
    });

    return fluid;
  };
}

function ScenarioFluidBuilder ({ steps: collection }: Pick<IGherkinAstScenario, 'steps'>): IScenarioBuilder {
  const scenario: IScenarioBuilder['scenario'] = {
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

function ScenarioOutlineFluidBuilder (gherkin: Pick<IGherkinAstScenarioOutline, 'steps' | 'examples'>): IScenarioOutlineBuilder {
  const { scenario, steps: { Given, When } } = ScenarioFluidBuilder(gherkin);

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

function BackgroundFluidBuilder ({ steps: collection }: Pick<IGherkinAstBackground, 'steps'>): IBackgroundBuilder {
  const background: IBackgroundBuilder['background'] = {
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
