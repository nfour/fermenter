import { readFileSync } from 'fs';
import * as Gherkin from 'gherkin';
import { dirname, isAbsolute, resolve } from 'path';
import { IAndFluid, IFluidFn, IFluidFnCallback, IGherkinMethods, IGivenFluid, IScenarioFluid, IWhenFluid } from './types';

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

export interface IScenarioBuilderFluid extends IScenarioFluid {
  scenario: IGherkinScenario;
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

  const feeder = new FeatureBuilder();

  const fluid = <IGherkinEngineFluid> {
    feature: {
      ast, parser, text: gherkinText,
    },
    Scenario: ScenarioFluidBuilder, // TODO: must use FeatureFeeder to feed the steps defined into the executor
    ScenarioOutline: ScenarioFluidBuilder,
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

export interface IGherkinFeature {
  Background?: {
    Given: IGherkinOperations,
  };
  Scenarios: Map<IMatch, IGherkinScenario>;
  ScenarioOutlines: Map<IMatch, IGherkinScenario>;
  Examples?: IGherkinOperations; // TODO: see what dis really should be

}

class FeatureBuilder {
  feature: IGherkinFeature = {
    Scenarios: new Map(),
    ScenarioOutlines: new Map(),
  };

  /** Instruments a ScenarioFluidBuilder */
  Scenario () {
    return (match: IMatch) => {
      const { scenario, ...steps } = ScenarioFluidBuilder(match);

      this.feature.Scenarios.set(scenario.match, scenario);

      return steps;
    };
  }

  /** Instruments a ScenarioFluidBuilder */
  ScenarioOutline () {
    return (match: IMatch) => {
      const { scenario, ...steps } = ScenarioFluidBuilder(match);

      this.feature.ScenarioOutlines.set(scenario.match, scenario);

      return steps;
    };
  }

  Background () {
    return (match?: IMatch) => {

    }
  }

}

function executeFeature () {

}

function mapGherkinToFeature () {

}

function ScenarioFluidBuilder (scenarioMatch: IMatch): IScenarioBuilderFluid {
  const scenario: Required<IGherkinScenario> = {
    match: scenarioMatch,
    Given: new Map(),
    Then: new Map(),
    When: new Map(),
  };

  const FluidFn = <R>(fluid: R, store: IGherkinOperations): IFluidFn<R> =>
    (match, fn) => {
      store.set(match, fn);

      return fluid;
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

  return { Given, Then, When, scenario };
}

function readInputFile ({ filePath, testFilePath }: { filePath: string, testFilePath?: string }) {
  if (isAbsolute(filePath)) {
    return readFileSync(filePath, 'utf8');
  } else {
    const testDirectory = dirname(testFilePath!);

    return readFileSync(resolve(testDirectory, filePath), 'utf8');
  }
}
