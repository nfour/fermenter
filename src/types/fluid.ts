import { AsyncReturnType, IMatch } from './';
import { IGherkinStepOptions } from './parser';

export interface IGherkinMethods extends IGherkinHooks {
  Scenario: (<S = any> (match: IMatch) => IScenarioFluid<S>) & {
    skip <S = any> (match: IMatch): IScenarioFluid<S>;
    pending <S = any> (match: IMatch): IScenarioFluid<S>;
  };
  ScenarioOutline: (<S = any> (match: IMatch) => IScenarioFluid<S>) & {
    skip <S = any> (match: IMatch): IScenarioFluid<S>;
    pending <S = any> (match: IMatch): IScenarioFluid<S>;
  };

  /**
   * Occasionally you'll find yourself repeating the same Given steps in all of the scenarios in a feature.
   * Since it is repeated in every scenario, this is an indication that those steps are not essential to describe the scenarios; they are incidental details. You can literally move such Given steps to the background, by grouping them under a Background section.
   *
   * - A Background allows you to add some context to the scenarios in the feature. It can contain one or more Given steps.
   * - A Background is run before each scenario, but after any Before hooks. In your feature file, put the Background before the first Scenario.
   * - You can only have one set of Background steps per feature. If you need different Background steps for different scenarios, you'll need to split them into different feature files.
   */
  Background: (<S = any> (match?: IMatch) => IBackgroundFluid<S>) & {
    skip <S = any> (match: IMatch): IBackgroundFluid<S>;
    pending <S = any> (match: IMatch): IBackgroundFluid<S>;
  };
}

export interface IGherkinHooks {
  /** Executed after all scenarios */
  AfterAll: IGherkinHook;

  /** Executed after each scenario */
  AfterEach: IGherkinHook;

  /** Executed before all scenarios */
  BeforeAll: IGherkinHook;

  /** Executed before each scenario */
  BeforeEach: IGherkinHook;
}

export type IGherkinHook = (callback: IHookCallback, options?: IGherkinStepOptions) => any;

export type IHookFn = (callback: IHookCallback, timeout?: number) => any;
export type IHookCallback = () => any;

export type IFluidFn<Fluid> = (key: RegExp|string, fn: IFluidCb, options?: IGherkinStepOptions) => Fluid;
export type IFluidCb<State = undefined> = (state: State, ...params: any[]) => any;

export interface IScenarioFluid<S = any> {
  Given: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IGivenFluid<AsyncReturnType<F>>;
  When: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IWhenFluid<AsyncReturnType<F>>;
  Then: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IAndFluid<AsyncReturnType<F>>;
}

export interface IBackgroundFluid<S = any> {
  Given: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IAndFluid<AsyncReturnType<F>>;
}

export interface IGivenFluid<S = any> {
  When: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IWhenFluid<AsyncReturnType<F>>;
  Then: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IAndFluid<AsyncReturnType<F>>;
  And: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IGivenFluid<AsyncReturnType<F>>;
}

export interface IWhenFluid<S = any> {
  Then: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IAndFluid<AsyncReturnType<F>>;
  And: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IWhenFluid<AsyncReturnType<F>>;
}

export interface IAndFluid<S = any> {
  And: <F extends IFluidCb<S>>(key: IMatch, fn: F, options?: IGherkinStepOptions) => IAndFluid<AsyncReturnType<F>>;
}
