import { Feature, IGherkinTableParam } from '../';

const getNumbers = (state: {} = {}, a: number, b: number) => {
  return {
    ...state,
    a, b,
  };
};

const addNumbers = (state: { a: number, b: number }) => {
  const { a, b } = state;

  return {
    ...state,
    c: a + b,
  };
};

const subtractNumbers = (state: { a: number, b: number }) => {
  const { a, b } = state;

  return {
    ...state,
    c: a - b,
  };
};

const multiplyNumbers = (state: { a: number, b: number }) => {
  const { a, b } = state;

  return {
    ...state,
    c: a * b,
  };
};

const checkResult = ({ c }: { c: number }, expected: number) => {
  expect(c).toBe(expected);
};

const afterAllFn = jest.fn();
const beforeAllFn = jest.fn();
const beforeEachFn = jest.fn();
const afterEachFn = jest.fn();

Feature('./features/calculator.feature', () => {
  expect(1).toBe(1);
});

Feature({ feature: './features/calculator.feature', methods: { afterAll, beforeAll, describe, test } }, ({
  Scenario, Background, ScenarioOutline,
  AfterAll, BeforeAll, AfterEach, BeforeEach,
}) => {
  Background('Calculator')
    .Given('I can calculate', () => {
      expect(Math).toBeTruthy();
    });

  Scenario('A simple addition test')
    .Given('I have the following numbers:', (state = {}, table: IGherkinTableParam) => {
      const [{ a, b }] = table.rows.mapByTop();

      return {
        ...state,
        a: parseInt(a, 10), b: parseInt(b, 10),
      };
    })
    .When('I add the numbers', addNumbers)
    .And('I do nothing', (state) => state)
    .Then('I get', (state, text: string) => {
      expect(state.c).toBe(parseInt(text, 10));
    });

  Scenario.skip('A simple multiplication test')
    .Given(/^I have numbers (\d+) and (\d+)$/, getNumbers)
    .When('I multiply the numbers', multiplyNumbers)
    .Then('I get {int}', checkResult);

  ScenarioOutline('A simple subtraction test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I subtract the numbers', subtractNumbers)
    .Then('I get {int}', checkResult);

  AfterAll(afterAllFn);
  BeforeAll(beforeAllFn);
  BeforeEach(beforeEachFn);
  AfterEach(afterEachFn);
});

it('runs a Feature', () => {
  const expectedAfterAllCalls = 1;

  // Wait for the tests to be run
  while (afterAllFn.mock.calls.length < expectedAfterAllCalls) { /**/ }

  expect(afterAllFn).toHaveBeenCalledTimes(expectedAfterAllCalls);
  expect(beforeAllFn).toHaveBeenCalledTimes(1);
  expect(beforeEachFn).toHaveBeenCalledTimes(3);
  expect(afterEachFn).toHaveBeenCalledTimes(3);
}, 10000);
