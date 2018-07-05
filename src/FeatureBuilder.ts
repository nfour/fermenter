import * as Interpolator from 'trans-interpolator';

import { IOnConfigured } from './GherkinTest';
import { GherkinTableReader } from './lib/GherkinTableReader';
import { IGherkinMatchCollectionParams, matchInGherkinCollection } from './lib/matchInGherkinCollection';
import { parseGherkinParameters } from './lib/parseGherkinParameters';
import {
  IAndFluid,
  IBackgroundBuilder,
  IFluidFn,
  IGherkinAst,
  IGherkinAstBackground,
  IGherkinAstScenario,
  IGherkinAstScenarioOutline,
  IGherkinCollectionItemIndex,
  IGherkinFeatureTest,
  IGherkinLazyOperationStore,
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
  feature = <IGherkinFeatureTest> {
    scenarios: [] as any,
    scenarioOutlines: [] as any,
    afterAll: [] as any,
    beforeAll: [] as any,
    afterEach: [] as any,
    beforeEach: [] as any,
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

      this.feature.scenarios = [...this.feature.scenarios, scenario];

      return steps;
    };
  }

  ScenarioOutline (onConfigured: IOnConfigured): IGherkinMethods['ScenarioOutline'] {
    const { gherkin: { children: collection } } = this.feature;

    return (match) => {
      const gherkin = matchInGherkinCollection<IGherkinAstScenarioOutline>({
        collection, match,
        matchProperty: 'name',
        type: 'ScenarioOutline',
      });

      const { scenarioOutline, scenarios, steps } = ScenarioOutlineFluidBuilder({ match, gherkin, onConfigured });

      this.feature.scenarios = [...this.feature.scenarios, ...scenarios];
      this.feature.scenarioOutlines = [...this.feature.scenarioOutlines, scenarioOutline];

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

      this.feature.background = background;

      return steps;
    };
  }

  AfterAll (): IGherkinMethods['AfterAll'] {
    return (fn) => {
      this.feature.afterAll = [...this.feature.afterAll, fn];
    };
  }

  BeforeAll (): IGherkinMethods['BeforeAll'] {
    return (fn) => {
      this.feature.beforeAll = [...this.feature.beforeAll, fn];
    };
  }

  AfterEach (): IGherkinMethods['AfterEach'] {
    return (fn) => {
      this.feature.afterEach = [...this.feature.afterEach, fn];
    };
  }

  BeforeEach (): IGherkinMethods['BeforeEach'] {
    return (fn) => {
      this.feature.beforeEach = [...this.feature.beforeEach, fn];
    };
  }
}

/**
 * A function is which returns a chainable interface
 * and instruments step definitions into a store when executed
 */
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

/**
 * Lazy Fluid Function. Only stores the `match` and `fn`
 */
function LazyFluidFn <R> ({ fluid, store }: {
  fluid: R,
  store: IGherkinLazyOperationStore,
}): IFluidFn<R> {
  return (match, fn) => {
    store.set(match, { fn });

    return fluid;
  };
}

function ScenarioFluidBuilder ({ match, gherkin, FluidFnFactory = FluidFn }: {
  match: IMatch,
  gherkin: IGherkinScenario['gherkin'] | IGherkinScenarioOutline['gherkin'],
  FluidFnFactory?: typeof FluidFn | typeof LazyFluidFn;
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
  const Then = FluidFnFactory({
    fluid: thenFluid,
    store: scenario.Then!,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  const whenFluid = <IWhenFluid> { Then };
  const When = FluidFnFactory({
    fluid: whenFluid,
    store: scenario.When!,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  const givenFluid = <IGivenFluid> { Then, When };
  const Given = FluidFnFactory({
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

function ScenarioOutlineFluidBuilder ({ match, gherkin, onConfigured }: {
  match: IMatch,
  gherkin: IGherkinScenarioOutline['gherkin'],
  onConfigured: IOnConfigured,
}): IScenarioOutlineBuilder {
  const {
    examples: [exampleSrc],
    steps: outlineSteps,
  } = gherkin;

  const examples = GherkinTableReader({
    rows: [exampleSrc.tableHeader, ...exampleSrc.tableBody || []],
  }).rows.mapByTop();

  const scenarioBuilders = examples.map((example, index) => {
    const interp = new Interpolator(example, { open: '<', close: '>' });

    const scenarioSteps = outlineSteps.map((step) => {
      return {
        ...step,
        text: interp.interpolate(step.text),
      };
    });

    return ScenarioFluidBuilder({
      match,
      gherkin: {
        type: 'Scenario',
        keyword: 'Scenario',
        description: gherkin.description,
        steps: scenarioSteps,
        location: gherkin.location,
        name: `${gherkin.name} (${index})`,
        tags: gherkin.tags,
      },
    });
  });

  const scenarios = scenarioBuilders.map(({ scenario }) => scenario);

  /** This is used to make the step methods DRY */
  const scenarioBuilderSkeleton = ScenarioFluidBuilder({ match, gherkin, FluidFnFactory: LazyFluidFn });
  const { steps } = scenarioBuilderSkeleton;

  type IStepMethodNames = 'Given' | 'When' | 'Then';

  const scenarioOutline: IScenarioOutlineBuilder['scenarioOutline'] = {
    ...scenarioBuilderSkeleton.scenario as Pick<IGherkinScenarioOutline, IStepMethodNames>,
    gherkin, match,
    scenarios,
    name: gherkin.name,
  };

  const methods: IStepMethodNames[] = ['Given', 'When', 'Then'];

  /**
   * When configured:
   *   - Invoke our Scenarios with the ScenarioOutline step definitions
   */
  onConfigured(() => {
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
