[![CircleCI](https://circleci.com/gh/nfour/fermenter.svg?style=svg)](https://circleci.com/gh/nfour/fermenter)

# Fermenter

- [Fermenter](#fermenter)
  - [Contributing](#contributing)
  - [Changelog](#changelog)

A gherkin based test runner which aims to be a **functional programming** alternative to `CucumberJS`

> Currently in heavy development, in an alpha state
> Near MVP completion

It lets you write something like this:

```ts
GherkinTest({ feature: './features/calculator.feature' }, ({ Scenario, Background, ScenarioOutline, Hook }) => {
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

  Hook('afterAll', () => {
    console.log('done')
  })
});
```

The above will be run against the gherkin file: [calculator.feature](src/tests/features/calculator.feature)

- It executes your feature file with `describe` and `test` provided (by default) by `jest`.
- It will be possible or mandatory to provide the framework functions, so that `mocha` and other compatible test runners can be utilized.

For updated reference, see:
- [src/tests/calculator.framework.test.ts](src/tests/calculator.framework.test.ts)
- [src/tests/features/calculator.feature](src/tests/features/calculator.feature)

## Contributing

> [CONTRIBUTING.md](./CONTRIBUTING.md)

## Changelog

> [CHANGELOG.md](./CHANGELOG.md)
