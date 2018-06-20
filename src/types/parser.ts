import {
  IBackgroundFluid, IFluidFnCallback, IGherkinAstScenario, IGherkinAstScenarioOutline,
  IScenarioFluid, IScenarioOutlineFluid,
} from '.';
import { IGherkinAstBackground, IGherkinAstEntity, IGherkinAstExamples, IGherkinAstFeature, IGherkinAstStep, IGherkinAstTableRow } from './ast';

// tslint:disable-next-line

export type IMatch = string | RegExp;

export type IGherkinCollectionItemShape = IGherkinAstEntity | IGherkinAstStep;
export type IGherkinCollectionItemIndex = IGherkinAstEntity & IGherkinAstStep;

export type IGherkinParams = string | number | IGherkinAstTableRow;

export interface IGherkinTableParam {

  /**
   * With Gherkin:
   * ```
   * | a | b |
   * | 1 | 2 |
   * ```
   * @example
   *
   * [ ...table.rows() ]
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
     *   [ ['a', '1'], ['b', '2'] ],
     *   [ ['a', '3'], ['b', '4'] ],
     * ]
     */
    mapByTop (): Array<Map<string, string>>;
  };

  /**
   * With Gherkin:
   * ```
   * | a | b |
   * | 1 | 2 |
   * | 1 | 2 |
   * ```
   * @example
   *
   * [ ...table.dict() ]
   *
   * // returns a Map, mapped to the header as keys
   *
   * [
   *   [ 'a', ['1', '1'] ],
   *   [ 'b', ['2', '2'] ],
   * ]
   *
   */
  dict: {
    (): Map<string, string[]>;

    /**
     * With Gherkin:
     * ```
     * | a | 1 | 3 |
     * | b | 2 | 4 |
     * ```
     * @example
     *
     * [ ...table.dict.left() ]
     *
     * // returns a Map, mapped to the left column as keys
     *
     * [
     *   [ 'a', ['1', '3'] ],
     *   [ 'b', ['2', '4'] ],
     * ]
     *
     */
    left (): Map<string, string[]>;

    /**
     * With Gherkin:
     * ```
     * |   | x | y |
     * | a | 1 | 3 |
     * | b | 2 | 4 |
     * ```
     * @example
     *
     * [ ...table.dict.matrix() ]
     *
     * // returns a Map, mapped to the left column as keys into a Map of head column keys
     *
     * [
     *   [ 'a', [[ 'x', '1' ], ['y', '3']] ],
     *   [ 'b', [[ 'x', '2' ], ['y', '4']] ],
     * ]
     *
     */
    matrix (): Map<string, Map<string, string>>
  };

  /**
   * With Gherkin:
   * ```
   * | a | b |
   * | 1 | 2 |
   * | 1 | 2 |
   * ```
   * @example
   *
   * [ ...table.headers() ]
   *
   * // returns
   *
   * ['a', 'b']
   */
  headers (): string[];
}

export interface IGherkinFeatureMappings<Ge = any> {
  match: IMatch;
  gherkin: Ge;
}

export interface IScenarioBuilder<
  S extends IGherkinScenario | IGherkinScenarioOutline = IGherkinScenario
> {
  steps: IScenarioFluid;
  scenario: S;
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
  steps: IScenarioOutlineFluid;
  scenarioOutline: IGherkinScenarioOutline;
}

export type IGherkinOperationStore<
  G extends IGherkinCollectionItemShape = IGherkinCollectionItemShape
> = Map<IMatch, {
  fn: IFluidFnCallback,
  name: string;
  gherkin: G;
  params: any[], // TODO: this needs to be array of string/int/data table
}>;

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
  Examples: IGherkinOperationStore<IGherkinAstExamples>;
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

  Background?: IGherkinBackground;
  Scenarios: Map<IMatch, IGherkinScenario>;
  ScenarioOutlines: Map<IMatch, IGherkinScenarioOutline>;
}
