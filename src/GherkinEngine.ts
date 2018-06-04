import { readFileSync } from 'fs';
import * as Gherkin from 'gherkin';
import { dirname, isAbsolute, resolve } from 'path';
import {
  IAndFluid, IBackgroundFluid, IFluidFn, IFluidFnCallback, IGherkinMethods,
  IGivenFluid, IScenarioFluid, IScenarioOutlineExamplesFluid, IScenarioOutlineFluid, IWhenFluid,
} from './types';

export interface IGherkinEngineOutput {
  methods: IGherkinMethods;
  ast: any;
  parser: any;
  text: string;
  builder: FeatureBuilder;
}

export interface IGherkinEngineConfig {
  feature: string;
  stackIndex?: number;
}

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

export function GherkinEngine ({ feature, stackIndex = 2 }: IGherkinEngineConfig): IGherkinEngineOutput {
  const testFilePath = new Error().stack!
    .split('\n')[stackIndex]
    .match(/\(([^:]+):/ig)![0]
    .replace(/^\(|:$/g, '');

  const text = readInputFile({ filePath: feature, testFilePath });
  const parser = new Gherkin.Parser();
  const ast = parser.parse(text);

  const builder = new FeatureBuilder();

  const methods = <IGherkinMethods> {
    Scenario: builder.Scenario(),
    ScenarioOutline: builder.ScenarioOutline(),
    Background: builder.Background(),
  };

  return { ast, methods, parser, text, builder };
}

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

class FeatureBuilder {
  feature: IGherkinFeature = {
    Scenarios: new Map(),
    ScenarioOutlines: new Map(),
  };

  /** Instruments a ScenarioFluidBuilder */
  Scenario (): IGherkinMethods['Scenario'] {
    return (match) => {
      const { scenario, steps } = ScenarioFluidBuilder(match);

      this.feature.Scenarios.set(scenario.match, scenario);

      return steps;
    };
  }

  /** Instruments a ScenarioFluidBuilder */
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

function executeFeature () {

}

function mapGherkinToFeature () {

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

function readInputFile ({ filePath, testFilePath }: { filePath: string, testFilePath?: string }) {
  if (isAbsolute(filePath)) {
    return readFileSync(filePath, 'utf8');
  } else {
    const testDirectory = dirname(testFilePath!);

    return readFileSync(resolve(testDirectory, filePath), 'utf8');
  }
}
