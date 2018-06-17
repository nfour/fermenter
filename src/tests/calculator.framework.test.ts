import { GherkinTest } from '../GherkinTest';

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

const multiplyNumbers = (state: IState) => {
  const { a, b } = state;

  return {
    ...state,
    c: a * b,
  };
};

const checkResult = ({ c }: IState, expected: number) => {
  expect(c).toBe(expected);
};

/**
 * TODO: provide a concept for the framework Composition Root for injecting base-state in
 * eg. sdk, browser (for ui testing) and other environment related things that
 * would cross the test-file barrier
 */
GherkinTest({ feature: './features/calculator.feature' }, ({ Scenario, Background, ScenarioOutline }) => {
  Background('Calculator')
    .Given('I can calculate', () => {
      expect(Math).toBeTruthy();
    });

  Scenario('A simple addition test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I add the numbers', addNumbers)
    .Then('I get {int}', checkResult);

  Scenario('A simple multiplication test')
    .Given(/^I have numbers (\d+) and (\d+)$/, getNumbers)
    .When('I multiply the numbers', multiplyNumbers)
    .Then('I get {int}', checkResult);

  // TODO: temporary
  // ScenarioOutline('A simple subtraction test')
  //   .Given('I have numbers {int} and {int}', getNumbers)
  //   .When('I subtract the numbers', addNumbers)
  //   .Then('I get {int}', checkResult);
});
