import * as Interpolator from 'trans-interpolator';

import { IOnConfigured } from './Feature';
import { GherkinTableReader } from './lib/GherkinTableReader';
import { IGherkinMatchCollectionParams, matchInGherkinCollection } from './lib/matchInGherkinCollection';
import { parseGherkinParameters } from './lib/parseGherkinParameters';
import {
  IAndFluid, IBackgroundBuilder, IBackgroundFluid, IFluidFn, IGherkinAst, IGherkinAstBackground, IGherkinAstScenario,
  IGherkinAstScenarioOutline, IGherkinBackground, IGherkinCollectionItemIndex, IGherkinFeatureTest,
  IGherkinLazyOperationStore, IGherkinMethods, IGherkinOperationStore, IGherkinScenario, IGherkinScenarioOutline,
  IGherkinStepOptions, IGivenFluid, IMatch, IScenarioBuilder, IScenarioFluid, IScenarioOutlineBuilder, IWhenFluid, Omit,
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

    const build = (match: IMatch) => {
      const gherkin = matchInGherkinCollection<IGherkinAstScenario>({
        collection, match,
        matchProperty: 'name',
        type: 'Scenario',
      });

      return ScenarioFluidBuilder({ match, gherkin });
    };

    const EntryPoint = (overrides: Partial<IGherkinScenario> = {}) => {
      return (match: IMatch) => {
        const { definition, steps } = build(match);

        this.feature.scenarios = [...this.feature.scenarios, { ...definition, ...overrides }];

        return steps;
      };
    };

    const fn = <IGherkinMethods['Scenario']> EntryPoint();
    fn.skip = EntryPoint({ skip: true });
    fn.only = EntryPoint({ only: true });

    return fn;
  }

  ScenarioOutline (onConfigured: IOnConfigured): IGherkinMethods['ScenarioOutline'] {
    const { gherkin: { children: collection } } = this.feature;

    const build = (match: IMatch) => {
      const gherkin = matchInGherkinCollection<IGherkinAstScenarioOutline>({
        collection, match,
        matchProperty: 'name',
        type: 'ScenarioOutline',
      });

      return ScenarioOutlineFluidBuilder({ match, gherkin, onConfigured });
    };

    const EntryPoint = (overrides: Partial<IGherkinScenario> = {}) => {
      return (match: IMatch) => {
        const { scenarioOutline, scenarios, steps } = build(match);

        this.feature.scenarios = [
          ...this.feature.scenarios,
          ...scenarios.map((scenario) => ({ ...scenario, ...overrides })),
        ];

        this.feature.scenarioOutlines = [
          ...this.feature.scenarioOutlines,
          scenarioOutline,
        ];

        return steps;
      };
    };

    const fn = <IGherkinMethods['ScenarioOutline']> EntryPoint();
    fn.skip = EntryPoint({ skip: true });
    fn.only = EntryPoint({ only: true });

    return fn;
  }

  Background (): IGherkinMethods['Background'] {
    const { gherkin: { children: collection } } = this.feature;

    const build = (match: IMatch = '') => {
      const gherkin = matchInGherkinCollection<IGherkinAstBackground>({
        collection, match,
        matchProperty: 'name',
        type: 'Background',
      });

      return BackgroundFluidBuilder({ match, gherkin });
    };

    const fn = (match: IMatch = '') => {
      const { definition, steps } = build(match);

      this.feature.background = definition;

      return steps;
    };

    return fn;
  }

  AfterAll (): IGherkinMethods['AfterAll'] {
    return (fn, options = {}) => {
      this.feature.afterAll = [...this.feature.afterAll, { fn, ...options }];
    };
  }

  BeforeAll (): IGherkinMethods['BeforeAll'] {
    return (fn, options = {}) => {
      this.feature.beforeAll = [...this.feature.beforeAll, { fn, ...options }];
    };
  }

  AfterEach (): IGherkinMethods['AfterEach'] {
    return (fn, options = {}) => {
      this.feature.afterEach = [...this.feature.afterEach, { fn, ...options }];
    };
  }

  BeforeEach (): IGherkinMethods['BeforeEach'] {
    return (fn, options = {}) => {
      this.feature.beforeEach = [...this.feature.beforeEach, { fn, ...options }];
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
  return (match, fn, options = {}) => {
    const gherkin: IGherkinCollectionItemIndex = matchInGherkinCollection({
      match,
      ...collectionParams,
    });

    store.set(match, {
      fn,
      gherkin,
      name: gherkin[collectionParams.matchProperty],
      params: parseGherkinParameters(gherkin, match),
      ...options,
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
  return (match, fn, options: IGherkinStepOptions = {}) => {
    store.set(match, { fn, ...options });

    return fluid;
  };
}

function ScenarioFluidBuilder ({ match, gherkin, FluidFnFactory = FluidFn }: {
  match: IMatch,
  gherkin: IGherkinScenario['gherkin'] | IGherkinScenarioOutline['gherkin'],
  FluidFnFactory?: typeof FluidFn;
}): IScenarioBuilder {
  const { steps: collection } = gherkin;

  const definition = <IScenarioBuilder['definition']> {
    match, gherkin,
    name: gherkin.name,
    Given: new Map(),
    Then: new Map(),
    When: new Map(),
  };

  const thenFluid = <IAndFluid<any>> {};
  const Then = <IScenarioFluid['Then']> FluidFnFactory({
    fluid: thenFluid,
    store: definition.Then!,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  const whenFluid = <IWhenFluid<any>> { Then };
  const When = <IScenarioFluid['When']> FluidFnFactory({
    fluid: whenFluid,
    store: definition.When!,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  const givenFluid = <IGivenFluid<any>> { Then, When };
  const Given = <IScenarioFluid['Given']> FluidFnFactory({
    fluid: givenFluid,
    store: definition.Given!,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  // Apply conjuctions via mutation
  thenFluid.And = Then;
  whenFluid.And = When;
  givenFluid.And = Given;

  return {
    definition,
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

  const scenarios = scenarioBuilders.map(({ definition }) => definition);

  /** This is used to make the step methods DRY */
  const scenarioBuilderSkeleton = ScenarioFluidBuilder({ match, gherkin, FluidFnFactory: LazyFluidFn });
  const { steps } = scenarioBuilderSkeleton;

  type IStepMethodNames = 'Given' | 'When' | 'Then';

  const scenarioOutline: IScenarioOutlineBuilder['scenarioOutline'] = {
    ...scenarioBuilderSkeleton.definition as Pick<IGherkinScenarioOutline, IStepMethodNames>,
    gherkin, match,
    scenarios,
    name: gherkin.name,
    skip: false,
    only: false,
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
          const method = <IFluidFn<any>> stepMethods[name];

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

  const definition: IBackgroundBuilder['definition'] = {
    gherkin, match,
    name: gherkin.name,
    Given: new Map(),
    skip: false,
    only: false,
  };

  const givenFluid = <IAndFluid<any>> {};
  const Given = <IBackgroundFluid['Given']> FluidFn({
    fluid: givenFluid,
    store: definition.Given,
    collectionParams: { collection, matchProperty: 'text', type: 'Step' },
  });

  givenFluid.And = Given;

  return {
    definition,
    steps: { Given },
  };
}
