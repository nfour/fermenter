import { IMatch } from '.';

export interface IGherkinMethods extends IGherkinHooks {
  Scenario: (match: IMatch) => IScenarioFluid;
  ScenarioOutline: (match: IMatch) => IScenarioFluid;

  /**
   * Occasionally you'll find yourself repeating the same Given steps in all of the scenarios in a feature.
   * Since it is repeated in every scenario, this is an indication that those steps are not essential to describe the scenarios; they are incidental details. You can literally move such Given steps to the background, by grouping them under a Background section.
   *
   * - A Background allows you to add some context to the scenarios in the feature. It can contain one or more Given steps.
   * - A Background is run before each scenario, but after any Before hooks. In your feature file, put the Background before the first Scenario.
   * - You can only have one set of Background steps per feature. If you need different Background steps for different scenarios, you'll need to split them into different feature files.
   */
  Background: (match?: IMatch) => IBackgroundFluid;
}

export interface IGherkinHooks {
  /** Executed after all scenarios */
  AfterAll: IHookFn;

  /** Executed after each scenario */
  AfterEach: IHookFn;

  /** Executed before all scenarios */
  BeforeAll: IHookFn;

  /** Executed before each scenario */
  BeforeEach: IHookFn;
}

export type IHookFn = (callback: () => Promise<any>|any) => void;

export interface IAndFluid {
  And: IFluidFn<IAndFluid>;
}

export interface IScenarioFluid {
  Given: IFluidFn<IGivenFluid>;
  When: IFluidFn<IWhenFluid>;
  Then: IFluidFn<IAndFluid>;
}

export interface IBackgroundFluid {
  Given: IFluidFn<IAndFluid>;
}

export interface IScenarioFluid {
  Given: IFluidFn<IGivenFluid>;
  When: IFluidFn<IWhenFluid>;
  Then: IFluidFn<IAndFluid>;
}

export interface IGivenFluid {
  When: IFluidFn<IWhenFluid>;
  Then: IFluidFn<IAndFluid>;
  And: IFluidFn<IGivenFluid>;
}

export interface IWhenFluid {
  Then: IFluidFn<IAndFluid>;
  And: IFluidFn<IWhenFluid>;
}

export type IFluidFn<Fluid> = (key: RegExp|string, fn: IFluidFnCallback) => Fluid;
export type IFluidFnCallback<State = any> = (state: State, ...params: any[]) => State;
