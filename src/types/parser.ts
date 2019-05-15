import { IBackgroundFluid, IFluidCb, IGherkinAstScenario, IGherkinAstScenarioOutline, IScenarioFluid } from './';
import {
  IGherkinAstBackground, IGherkinAstEntity, IGherkinAstFeature, IGherkinAstStep, IGherkinAstTableRow,
} from './ast';
import { IHookCallback } from './fluid';

export type IMatch = string | RegExp;

export type IGherkinCollectionItemShape = IGherkinAstEntity | IGherkinAstStep;
export type IGherkinCollectionItemIndex = IGherkinAstEntity & IGherkinAstStep;

export type IGherkinParams = string | number | IGherkinAstTableRow;

export interface IGherkinFeatureMappings<Ge = any> {
  match: IMatch;
  gherkin: Ge;
}

export interface IScenarioBuilder {
  steps: IScenarioFluid;
  definition: IGherkinScenario;
}

export interface IBackgroundBuilder {
  steps: IBackgroundFluid;
  definition: IGherkinBackground;
}

/**
 * Produces a subset ScenarioOutline that looks like this:
 * @example { Given, When, Then, Examples: { operations } }
 */
export interface IScenarioOutlineBuilder {
  steps: IScenarioFluid;
  scenarioOutline: IGherkinScenarioOutline;
  scenarios: IGherkinFeatureTest['scenarios'];
}

export interface IDict<V> { [k: string]: V; }
export type IGherkinParameter = string | number | IGherkinTableParam;

export type IGherkinOperationStore<
  G extends IGherkinCollectionItemShape = IGherkinCollectionItemShape
> = Map<IMatch, IGherkinStep<G>>;

export interface IGherkinStepOptions {
  timeout?: number;
  skip?: boolean;
}

export interface IGherkinStep<
  G extends IGherkinCollectionItemShape = IGherkinCollectionItemShape
> extends IGherkinStepOptions {
  fn: IFluidCb;
  name: string;
  gherkin: G;
  params: IGherkinParameter[];
  definition: IGherkinDefinition;
}

export type IGherkinLazyOperationStore = Map<IMatch, { fn: IFluidCb } & IGherkinStepOptions>;

export interface IGherkinTestSupportFlags {
  skip: boolean;
  only: boolean;
}

export interface IGherkinScenarioBase extends IGherkinTestSupportFlags, IGherkinDefinition {
  Given?: IGherkinOperationStore<IGherkinAstStep>;
  When?: IGherkinOperationStore<IGherkinAstStep>;
  Then?: IGherkinOperationStore<IGherkinAstStep>;
}

export interface IGherkinDefinition {
  match: IMatch;
  name: string;
  gherkin: IGherkinAstScenario|IGherkinAstScenarioOutline|IGherkinAstBackground;
  feature: IGherkinAstFeature;
}

export interface IGherkinScenario extends IGherkinScenarioBase {
  gherkin: IGherkinAstScenario;
}

export interface IGherkinScenarioOutline extends IGherkinScenarioBase {
  gherkin: IGherkinAstScenarioOutline;
}

export interface IGherkinBackground extends IGherkinTestSupportFlags, IGherkinDefinition {
  gherkin: IGherkinAstBackground;
  Given: IGherkinOperationStore<IGherkinAstStep>;
}

export interface IHookStep extends IGherkinStepOptions {
  fn: IHookCallback;
}

export interface IGherkinFeatureTest {
  gherkin: IGherkinAstFeature;
  name: IGherkinAstFeature['name'];

  background?: IGherkinBackground;
  scenarios: IGherkinScenario[];
  scenarioOutlines: IGherkinScenarioOutline[];

  afterAll: IHookStep[];
  beforeAll: IHookStep[];
  afterEach: IHookStep[];
  beforeEach: IHookStep[];
}

/** Alias to IGherkinTableParam */
export type ITable = IGherkinTableParam;

export interface IGherkinTableParam {

  /**
   * With Gherkin:
   * ```
   * | a | b |
   * | 1 | 2 |
   * ```
   * @example
   *
   * table.rows()
   *
   * // returns
   *
   * [
   *   [ 'a', 'b' ],
   *   [ '1', '2' ],
   * ]
   *
   */
  rows: {
    <T extends string>(): T[][];

    /**
     * With Gherkin:
     *
     * ```
     * | a | b |
     * | 1 | 2 |
     * | 3 | 4 |
     * ```
     *
     * @example
     *
     * table.rows.mapByTop()
     *
     * // returns an array of Map's, mapped to the header as keys
     *
     * [
     *   { a: '1', b: '2' },
     *   { a: '3', b: '4' },
     * ]
     */
    mapByTop <T extends {} = IDict<string>> (): T[];
  };

  /**
   * With Gherkin:
   * ```
   * | a | b |
   * | 1 | 2 |
   * | 1 | 2 |
   * ```
   *
   * @example
   *
   * table.dict()
   *
   * // returns a Map, mapped to the header as keys
   *
   * {
   *   a: ['1', '1'],
   *   b: ['2', '2'],
   * }
   *
   */
  dict: {
    <T extends {} = IDict<string[]>>(): T

    /**
     * With Gherkin:
     * ```
     * | a | 1 | 3 |
     * | b | 2 | 4 |
     * ```
     *
     * @example
     *
     * table.dict.left()
     *
     * // returns a Map, mapped to the left column as keys
     *
     * {
     *   a: ['1', '3'],
     *   b: ['2', '4'],
     * }
     *
     */
    left <T extends {} = IDict<string[]>> (): T

    /**
     * With Gherkin:
     * ```
     * |   | x | y |
     * | a | 1 | 3 |
     * | b | 2 | 4 |
     * ```
     *
     * @example
     *
     * table.dict.matrix()
     *
     * // returns a Map, mapped to the left column as keys into a Map of head column keys
     *
     * {
     *   a: { x: '1', y: '3' },
     *   b: { x: '2', y: '4' },
     * }
     *
     */
    matrix <T extends { [k: string]: {}} = IDict<IDict<string>>> (): T;
  };

  /**
   * With Gherkin:
   * ```
   * | a | b |
   * | 1 | 2 |
   * | 1 | 2 |
   * ```
   *
   * @example
   *
   * table.headers()
   *
   * // returns
   *
   * ['a', 'b']
   *
   */
  headers <T extends string[]> (): T;
}
