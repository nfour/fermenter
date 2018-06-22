import * as Interpolator from 'trans-interpolator';

import { GherkinTableReader } from './lib/GherkinTableReader';
import { IGherkinMatchCollectionParams, matchInGherkinCollection } from './lib/matchInGherkinCollection';
import { parseGherkinParameters } from './lib/parseGherkinParameters';
import { mapToObject } from './lib/utils';
import {
  IAndFluid,
  IBackgroundBuilder,
  IFluidFn,
  IGherkinAst,
  IGherkinAstBackground,
  IGherkinAstScenario,
  IGherkinAstScenarioOutline,
  IGherkinCollectionItemIndex,
  IGherkinFeature,
  IGherkinMethods,
  IGherkinOperationStore,
  IGherkinScenario,
  IGherkinScenarioOutline,
  IGivenFluid,
  IMatch,
  IScenarioBuilder,
  IScenarioOutlineBuilder,
  IWhenFluid,
  Omit,
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

      const { scenario, steps } = ScenarioFluidBuilder({ match, gherkin });

      this.feature.Scenarios.set(match, scenario);

      return steps;
    };
  }

  ScenarioOutline (whenConfigured: PromiseLike<any>): IGherkinMethods['ScenarioOutline'] {
    const { gherkin: { children: collection } } = this.feature;

    return (match) => {
      const gherkin = matchInGherkinCollection<IGherkinAstScenarioOutline>({
        collection, match,
        matchProperty: 'name',
        type: 'ScenarioOutline',
      });

      const { scenarioOutline, scenarios, steps } = ScenarioOutlineFluidBuilder({ match, gherkin, whenConfigured });

      this.feature.Scenarios = new Map([...this.feature.Scenarios, ...scenarios]);
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

      const { background, steps } = BackgroundFluidBuilder({ match, gherkin });

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
      gherkin,
      name: gherkin[collectionParams.matchProperty],
      params: parseGherkinParameters(gherkin, match),
    });

    return fluid;
  };
}

function ScenarioFluidBuilder ({ match, gherkin }: {
  match: IMatch,
  gherkin: IGherkinScenario['gherkin'] | IGherkinScenarioOutline['gherkin'],
}): IScenarioBuilder {
  const { steps: collection } = gherkin;

  const scenario = <IScenarioBuilder['scenario']> {
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

function ScenarioOutlineFluidBuilder ({ match, gherkin, whenConfigured }: {
  match: IMatch,
  gherkin: IGherkinScenarioOutline['gherkin'],
  whenConfigured: PromiseLike<any>,
}): IScenarioOutlineBuilder {
  const {
    examples: [exampleSrc],
    steps: outlineSteps,
  } = gherkin;

  const examples = GherkinTableReader({
    rows: [...exampleSrc.tableHeader, ...exampleSrc.tableBody],

  }).rows.mapByTop();

  const scenarioBuilders = examples.map((example) => {
    const { interpolate } = new Interpolator(
      mapToObject(example),
      { open: '<', close: '>' },
    );

    const scenarioSteps = outlineSteps.map((step) => {
      return {
        ...step,
        text: interpolate(step.text),
      };
    });

    return ScenarioFluidBuilder({
      match,
      gherkin: {
        ...gherkin as any,
        type: 'Scenario',
        steps: scenarioSteps,
      },
    });
  });

  const scenarios = new Map(
    scenarioBuilders.map(({ scenario }): [IMatch, typeof scenario] => [scenario.match, scenario]),
  );

  /** This is used to make the step methods DRY */
  const scenarioBuilderSkeleton = ScenarioFluidBuilder({ match, gherkin });

  const { steps } = scenarioBuilderSkeleton;

  const scenarioOutline: IScenarioOutlineBuilder['scenarioOutline'] = {
    ...scenarioBuilderSkeleton.scenario as Pick<IGherkinScenarioOutline, 'Given' | 'When' | 'Then'>,
    gherkin, match,
    scenarios,
    name: gherkin.name,
  };

  const methods: Array<'Given' | 'When' | 'Then'> = ['Given', 'When', 'Then'];

  /**
   * When configured: instrument our Scenarios with the ScenarioOutline step definitions
   */
  whenConfigured.then(() => {
    methods.forEach((name) => {
      const operations = scenarioOutline[name];

      if (!operations) { return; }

      operations.forEach(({ fn }, operationMatch) => {
        scenarioBuilders.forEach(({ steps: stepMethods }) => {
          const method = stepMethods[name];

          method(operationMatch, fn);
        });
      });
    });
  });

  return { scenarioOutline, scenarios, steps };
}

function BackgroundFluidBuilder ({ match, gherkin }: {
  match: IMatch,
  gherkin: IGherkinAstBackground,
}): IBackgroundBuilder {
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
