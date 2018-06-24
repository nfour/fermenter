![CircleCI](https://img.shields.io/circleci/project/github/nfour/fermenter.svg?style=flat-square)![npm](https://img.shields.io/npm/v/fermenter.svg?style=flat-square)![npm](https://img.shields.io/npm/dt/fermenter.svg?style=flat-square)![Github commits (since latest release)](https://img.shields.io/github/commits-since/nfour/fermented/latest.svg?style=flat-square)

# Fermenter

A gherkin based test runner which aims to be a **functional programming** alternative to `CucumberJS`

Currently an alpha MVP.

- [Fermenter](#fermenter)
    - [About](#about)
    - [Execution](#execution)
  - [Contributing](#contributing)
  - [Changelog](#changelog)

### About

It lets you write something like this:

```ts
import { GherkinTest } from 'fermenter';
import { getNumbers /* ... */ } from './steps';

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

For reference, see:
- [src/tests/calculator.framework.test.ts](src/tests/calculator.framework.test.ts)
- [src/tests/features/calculator.feature](src/tests/features/calculator.feature)

### Execution

Like CucumberJS:
- Uses same gherkin parser and expression parser

Unlike CucumberJS:
- **Scenarios** and **ScenarioOutlines** are executed with fresh `state` which is reduced through each step function
- Step functions are executed without `this` context, and are intended to be pure.
- Strong TypeScript support for step state constraints
- Step definition names no longer have to be unique for every feature file.
  - If you want to re-use a step, you simply pass it the same step function
- Entering a file with a `GherkinTest` should show you exactly where all the logic is coming in from - zero magic.
- It executes your feature file with `describe` and `test` etc. provided (by default) by `jest`.
  - It will be mandatory to provide these framework functions, so that `mocha` and other compatible test runners can be used
  - This means no global pollution and no framework dependencies holding you back

## Contributing

- [CONTRIBUTING.md](./CONTRIBUTING.md)

## Changelog

- [CHANGELOG.md](./CHANGELOG.md)
