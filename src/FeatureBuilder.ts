import * as Interpolator from 'trans-interpolator';
import { GherkinTableReader } from './lib/GherkinTableReader';
import { IGherkinMatchCollectionParams, matchInGherkinCollection } from './lib/matchInGherkinCollection';
import { parseGherkinParameters } from './lib/parseGherkinParameters';
import { mapToObject } from './lib/utils';
import {
  IAndFluid, IBackgroundBuilder, IFluidFn, IGherkinAst,
  IGherkinAstBackground, IGherkinAstScenario, IGherkinAstScenarioOutline,
  IGherkinAstStep, IGherkinCollectionItemIndex, IGherkinFeature, IGherkinMethods,
  IGherkinOperationStore, IGherkinScenario, IGherkinScenarioOutline,
  IGivenFluid, IMatch, IScenarioBuilder, IScenarioFluid, IScenarioOutlineBuilder, IScenarioOutlineExamplesFluid, IScenarioOutlineFluid, IWhenFluid, Omit,
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
      gherkin,
      name: gherkin[collectionParams.matchProperty],
      params: parseGherkinParameters(gherkin, match),
    });

    return fluid;
  };
}

function ScenarioFluidBuilder (match: IMatch, gherkin: IGherkinScenario['gherkin']): IScenarioBuilder {
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

function ScenarioOutlineFluidBuilder (match: IMatch, gherkin: IGherkinScenarioOutline['gherkin']): IScenarioOutlineBuilder {
  /**
   * TODO:
   * x make IGherkinScenarioOutline interface store an array of IGherkinScenario
   * x match the gherkin.examples IMMEDIATELY - if no examples #fuckThisShitImOut
   * x read the AST for a table, parse it
   * x generate a new Scenario for each row of the examples via table.mapByTop()
   * x read the ScenarioOutline AST and parse all `<varName>` as table.mapByTop().get('varName')
   * x use the resulting interpolated text to generate new IGherkinAstStep[] inside a new IGherkinAstScenario
   * - wait for ScenarioOutline fluid methods to be called, so that the `match` and `fn` can be used to generate a new Scenario
   * - run ScenarioFluidBuilder over the newly generated AST against the last outline fluid method definitions
   * - execute the resulting builder instances, saving each scenario's stores inside the IGherkinScenarioOutline['scenarios']
   */

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

    const { scenario, steps: methods } = ScenarioFluidBuilder(match, {
      ...gherkin as any,
      type: 'Scenario',
      steps: scenarioSteps,
    });

    function runScenarioFluidAgainstSteps (methods: IScenarioFluid, steps: IGherkinAstStep[]) {
      outlineSteps.forEach(({ keyword, text }) => {
        const methodKey = Object.keys(methods)
          .find((key) => keyword.startsWith(key));

        if (methodKey) {
          const method = methods[methodKey as keyof typeof methods];

          method(text);
        }
    }

    runScenarioFluidAgainstSteps(methods, outlineSteps);
    });

  const FluidFnProxy = (context: any, proxyFn: any) => (match: IMatch, fn: any) => {
    proxyFn(match, fn);

    return context;
  };

  const scenarios = scenarioBuilders.map((Scenario) => {
    Scenario();
  });

  const scenarioOutline: IScenarioOutlineBuilder['scenarioOutline'] = {
    scenarioBuilders,
    gherkin,
    match,
    name: gherkin.name,

  };

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
