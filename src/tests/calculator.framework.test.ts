import { GherkinTest } from '../lib/GherkinTest';

export interface IState {
  a: number;
  b: number;
  c: number;
}

const getNumbers = (state: Partial<IState> = {}, a: number, b: number) => {
  return {
    ...state,
    a, b,
  };
};

const addNumbers = (state: IState) => {
  const { a, b } = state;

  return {
    ...state,
    c: a + b,
  };
};

const checkResult = ({ c }: IState, expected: number) => {
  expect(c).toBe(expected);
};

GherkinTest({ feature: '../features/calculator.feature' }, ({ Scenario, Background, ScenarioOutline }) => {
  Background(() => {

  });

  Scenario('A simple arithmetic test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I add them', addNumbers)
    .Then('I get {int}', checkResult);

  ScenarioOutline('A simple arithmetic test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I add them', addNumbers)
    .Then('I get {int}', checkResult);
});
