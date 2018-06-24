[![CircleCI](https://circleci.com/gh/nfour/fermenter.svg?style=svg)](https://circleci.com/gh/nfour/fermenter)

# Fermenter

A gherkin based test runner which aims to be a **functional programming** alternative to `CucumberJS`

> Currently in heavy development, in an alpha state
> Near MVP completion

It lets you write something like this:


```ts
GherkinTest('./features/calculator.feature', ({ Scenario, Background, ScenarioOutline, Hook }) => {
  Background()
    .Given('I can calculate', () => {
      expect(Math).toBeTruthy();
    });

  Scenario('A simple addition test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I add the numbers', addNumbers)
    .Then('I get {int}', checkResult);

  Scenario('A simple multiplication test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I multiply the numbers', multiplyNumbers)
    .Then('I get {int}', checkResult);

  ScenarioOutline('A simple subtraction test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I subtract the numbers', subtractNumbers)
    .Then('I get {int}', checkResult);
});
```

For updated reference, see:
- [src/tests/calculator.framework.test.ts](src/tests/calculator.framework.test.ts)
- [src/tests/features/calculator.feature](src/tests/features/calculator.feature)
