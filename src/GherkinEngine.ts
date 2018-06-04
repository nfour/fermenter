import { readFileSync } from 'fs';
import * as Gherkin from 'gherkin';
import { dirname, isAbsolute, resolve } from 'path';
import { IAndFluid, IBackgroundFluid, IFluidFn, IFluidFnCallback, IGherkinMethods, IGivenFluid, IScenarioFluid, IScenarioOutlineFluid, IWhenFluid } from './types';

export interface IGherkinEngineFluid extends IGherkinMethods {
  feature: {
    ast: any,
    parser: any,
    text: string,
  };
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

export function GherkinEngine ({ feature, stackIndex = 2 }: IGherkinEngineConfig) {
  const testFilePath = new Error().stack!
    .split('\n')[stackIndex]
    .match(/\(([^:]+):/ig)![0]
    .replace(/^\(|:$/g, '');

  const gherkinText = readInputFile({ filePath: feature, testFilePath });
  const parser = new Gherkin.Parser();
  const ast = parser.parse(gherkinText);

  console.dir(ast, { depth: 6, colors: true });

  // TODO: read parser output so that:
  // - fluid interface can match to scenarios & steps
  // - match variables, outlines

  const builder = new FeatureBuilder();

  const fluid = <IGherkinEngineFluid> {
    feature: {
      ast, parser, text: gherkinText,
    },
    Scenario: builder.Scenario(),
    ScenarioOutline: builder.ScenarioOutline(),
    Background: builder.Background(),
  };

  return fluid;
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
  Scenario () {
    return (match: IMatch): IScenarioFluid => {
      const { scenario, steps } = ScenarioFluidBuilder(match);

      this.feature.Scenarios.set(scenario.match, scenario);

      return steps;
    };
  }

  /** Instruments a ScenarioFluidBuilder */
  ScenarioOutline () {
    return (match: IMatch): IScenarioOutlineFluid => {
      const { scenarioOutline, steps } = ScenarioOutlineFluidBuilder(match);

      this.feature.ScenarioOutlines.set(scenarioOutline.match, scenarioOutline);

      return steps;
    };
  }

  Background () {
    return (match: IMatch = ''): IBackgroundFluid => {
      const { background, steps } = ScenarioBackgroundFluidBuilder(match);

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

function ScenarioBackgroundFluidBuilder (match: IMatch): IBackgroundBuilderResult {
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
  const { scenario, steps } = ScenarioFluidBuilder(match);

  const scenarioOutline = <IGherkinScenarioOutline> {
    ...scenario,
    Examples: new Map(),
  };

  const Examples = FluidFn(steps, scenarioOutline.Examples);

  return {
    scenarioOutline,
    steps: { ...steps, Examples },
  };

}

function BackgroundFluidBuilder (match: IMatch): IGherkinFeature['Background']! {

}

function readInputFile ({ filePath, testFilePath }: { filePath: string, testFilePath?: string }) {
  if (isAbsolute(filePath)) {
    return readFileSync(filePath, 'utf8');
  } else {
    const testDirectory = dirname(testFilePath!);

    return readFileSync(resolve(testDirectory, filePath), 'utf8');
  }
}
