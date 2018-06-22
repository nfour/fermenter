import {
  IBackgroundFluid,
  IFluidFnCallback,
  IGherkinAstScenario,
  IGherkinAstScenarioOutline,
  IScenarioFluid,
} from '.';
import {
  IGherkinAstBackground,
  IGherkinAstEntity,
  IGherkinAstFeature,
  IGherkinAstStep,
  IGherkinAstTableRow,
} from './ast';

// tslint:disable-next-line

export type IMatch = string | RegExp;

export type IGherkinCollectionItemShape = IGherkinAstEntity | IGherkinAstStep;
export type IGherkinCollectionItemIndex = IGherkinAstEntity & IGherkinAstStep;

export type IGherkinParams = string | number | IGherkinAstTableRow;

// TODO: add a generic to populate table interfaces for known props
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
    (): string[][];

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
    mapByTop (): Array<IDict<string>>;
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
    (): IDict<string[]>

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
    left (): IDict<string[]>

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
    matrix (): IDict<IDict<string>>,
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
  headers (): string[];
}

export interface IGherkinFeatureMappings<Ge = any> {
  match: IMatch;
  gherkin: Ge;
}

export interface IScenarioBuilder {
  steps: IScenarioFluid;
  scenario: IGherkinScenario;
}

export interface IBackgroundBuilder {
  steps: IBackgroundFluid;
  background: IGherkinBackground;
}

/**
 * Produces a subset ScenarioOutline that looks like this:
 * @example { Given, When, Then, Examples: { operations } }
 */
export interface IScenarioOutlineBuilder {
  steps: IScenarioFluid;
  scenarioOutline: IGherkinScenarioOutline;
  scenarios: IGherkinFeature['scenarios'];
}

export interface IDict<V> { [k: string]: V; }
export type IGherkinParameter = string | number | IGherkinTableParam;

export type IGherkinOperationStore<
  G extends IGherkinCollectionItemShape = IGherkinCollectionItemShape
> = Map<IMatch, IGherkinStep<G>>;

export interface IGherkinStep<G extends IGherkinCollectionItemShape = IGherkinCollectionItemShape> {
  fn: IFluidFnCallback;
  name: string;
  gherkin: G;
  params: IGherkinParameter[];
}

export type IGherkinLazyOperationStore = Map<IMatch, { fn: IFluidFnCallback }>;

export interface IGherkinScenarioBase {
  match: IMatch;
  name: IGherkinAstScenario['name'];
  Given?: IGherkinOperationStore<IGherkinAstStep>;
  When?: IGherkinOperationStore<IGherkinAstStep>;
  Then?: IGherkinOperationStore<IGherkinAstStep>;
}

export interface IGherkinScenario extends IGherkinScenarioBase {
  gherkin: IGherkinAstScenario;
}

export interface IGherkinScenarioOutline extends IGherkinScenarioBase {
  gherkin: IGherkinAstScenarioOutline;

  // TODO: remove this once it's clear it's not needed as we are pushing these to the feature.scenarios
  scenarios: Map<IMatch, IGherkinScenario>;
}

export interface IGherkinBackground {
  match: IMatch;
  name: IGherkinAstBackground['name'];
  gherkin: IGherkinAstBackground;
  Given: IGherkinOperationStore<IGherkinAstStep>;
}

export interface IGherkinFeature {
  gherkin: IGherkinAstFeature;
  name: IGherkinAstFeature['name'];

  background?: IGherkinBackground;
  scenarios: Map<IMatch, IGherkinScenario>;
  ScenarioOutlines: Map<IMatch, IGherkinScenarioOutline>;
}
