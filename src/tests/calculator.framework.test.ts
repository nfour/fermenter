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

const checkResult = ({ c }: IState, expected: number) => {
  expect(c).toBe(expected);
};

GherkinTest({ feature: './features/calculator.feature' }, ({ Scenario, Background, ScenarioOutline, Hook }) => {
  Background(() => {
    expect(Math).toBeTruthy();
  });

  Scenario('A simple addition test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I add the numbers', addNumbers)
    .Then('I get {int}', checkResult);

  Scenario('A simple multiplication test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I multiply the numbers', addNumbers)
    .Then('I get {int}', checkResult);

  ScenarioOutline('A simple subtraction test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I subtract the numbers', addNumbers)
    .Then('I get {int}', checkResult);
});
