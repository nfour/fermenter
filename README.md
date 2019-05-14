![CircleCI](https://img.shields.io/circleci/project/github/nfour/fermenter.svg?style=flat-square)![npm](https://img.shields.io/npm/v/fermenter.svg?style=flat-square)![npm](https://img.shields.io/npm/dt/fermenter.svg?style=flat-square)

# Fermenter

Fermenter is a tool for running tests written in the english-like language **Gherkin**.

It aims to be a **function programming** alternative to **[CucumberJS](https://github.com/cucumber/cucumber-js)** by doing away with things like global state and auto-discovery.

You use the same test runner you are used to: **Jest**, **Mocha**, **Ava**.

You also use the same expression parsers as CucumberJS:
- Gherkin language: [docs.cucumber.io/gherkin/reference](https://docs.cucumber.io/gherkin/reference)
- Cucumber Expressions: [docs.cucumber.io/cucumber/cucumber-expressions](https://docs.cucumber.io/cucumber/cucumber-expressions/)

-----------------------

+ [Examples](#examples)
  + [Advanced example](#advanced-example)
+ [Api](#api)
  + [Scenarios and skipping steps](#scenarios-and-skipping-steps)
  + [Background](#background)
  + [Tables](#tables)
  + [Scenario Outlines](#scenario-outlines)
  + [Global hooks](#global-hooks)
  + [Typescript tips](#typescript-tips)
  + [Using other test runners](#using-other-test-runners)
+ [How it works](#how-it-works)
  + [Coming from CucumberJS](#coming-from-cucumberjs)
  + [How it runs](#how-it-runs)
+ [More info](#more-info)


## Examples

Below is a very minimal example:

```ts
import { Feature } from 'fermenter';
import { sum } from 'lodash';

Feature('./features/calculator.feature', ({ Scenario }) => {
  Scenario('A simple addition test')
    .Given('I have numbers {int} and {int}', (state, num1, num2) => [num1, num2])
    .When('I add the numbers', sum)
    .Then('I get {int}', (summed, expectedResult) => {
      expect(summed).toBe(expectedResult);
    });
});
```

In the above example `state` is strongly typed throughout each step.

Below is a more realistic use of `state` with object spreading:

```ts
import { Feature } from 'fermenter';
import { sum } from 'lodash';

Feature('./features/calculator.feature', ({ Scenario }) => {
  Scenario('A simple addition test')
    .Given('I have numbers {int} and {int}', (state: {} = {}, num1, num2) => {
      return { ...state, numbers: [num1, num2] };
    })
    .When('I add the numbers', (state) => {
      return { ...state, summed: sum(state.numbers) };
    })
    .Then('I get {int}', ({ summed, numbers }, expectedResult) => {
      expect(numbers.length).toBe(2);
      expect(summed).toBe(expectedResult);
    });
});
```


The above test is explicitly mapped to the feature file`'./features/calculator.feature'`:

```gherkin
Feature: Calculator
  Scenario: A simple addition test
    Given I have numbers 3 and 4
    When I add the numbers
    Then I get 7
```

To run this test we simply use our test runner (in this case **Jest**) as normal:

```bash
$> yarn jest

 PASS  src/tests/calculator.test.ts
  Feature: Calculator
    Scenario: A simple addition test
      ✓ Given: I have numbers 3 and 4
      ✓ When: I add the numbers
      ✓ Then: I get 7
```

The above output is generated by the default **Jest** runner, and thus will include any debug, diff, snapshotting and the error stack traces you expect.

### Advanced example

Below is a more advanced example [calculator.test.ts](src/tests/calculator.test.ts):

```ts
import { delay } from 'bluebird';
import { Feature } from 'fermenter';
import { getNumbers, addNumbers, checkResult, multiplyNumbers } from './steps';

Feature('./features/calculator.feature', ({ Scenario, Background, ScenarioOutline, AfterAll }) => {
  Background()
    .Given('I can calculate', () => {
      expect(Math).toBeTruthy();
    });

  Scenario('A simple addition test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I add the numbers', addNumbers)
    .Then.skip('I get {int}', checkResult) // This scenario step is skipped
    .And('I get {int}') // This scenario step is skipped because its missing a callback

  // This scenario and its steps will be skipped
  Scenario.skip('A simple multiplication test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I multiply the numbers', multiplyNumbers)
    .Then('I get {int}', checkResult);

  ScenarioOutline('A simple subtraction test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When.skip('I subtract the numbers', subtractNumbers)
    .Then('I get {int}', async (state, expectedResult) => { // Functions can be async too!
      await delay(5000);

      expect(state.result).toBe(expectedResult);
    });

  AfterAll(() => {
    console.log('Done!')
  })
});
```

The above example maps to: [calculator.feature](src/tests/features/calculator.feature).

## Api

The project bundles TypeScript definitions and so the library api is easy to discover.

For more examples, see the tests: [src/tests](src/tests)

### Scenarios and skipping steps

```ts
Feature('./test.feature', ({ Scenario }) => {
  Scenario('The scenario')
    .Given('I can do stuff')

  Scenario.skip('The scenario') // Scenarios can be referred to more than once
    .Given('I can do stuff') // All steps are skipped due to .skip

  Scenario('Another scenario')
    .Then('I can do stuff') // Skipped: the callback is missing
    .And.skip('I can do stuff') // Skipped: because of .skip
    .And('I can do stuff', () => {}) // Not skipped!
})
```

Each of the above **Scenario** is executed with its own state initial state.

The state provided to the **Scenario** defaults to `{}`, an empty object unless specified otherwise by a **Background**. More on that later.

You may also choose one scenario to run with `only`:

```ts
Feature('./test.feature', ({ Scenario }) => {
  Scenario('The scenario')
    .Given('I can do stuff', () => {}) // Skipped!

  Scenario.only('The scenario')
    .Given('I can do stuff', () => {}) // Not skipped!

  Scenario('Another scenario')
    .Given('I can do stuff', () => {}) // Skipped!
})
```

Skipping behaviour:
- When a **individual step** is skipped:
  - The skipped function is replaced with `(v) => v`. A state **passthrough** function.
  - Steps after it are **NOT** skipped.
- When an entire **Scenario** is skipped:
  - **All steps** are skipped

### Background

**Backgrounds** are used to define common state/preparation between scenarios.

Building on top of the previous example, lets add a background to supply some initial state to the **Scenario**.

```ts
import { Feature } from 'fermenter';
import { sum } from 'lodash';

Feature('./features/calculator.feature', ({ Scenario, Background }) => {
  Background()
    .Given('I start with {int}', (state, initialNum) => initialNum)

  /** We have to tell TypeScript what the background return type is */
  Scenario<number>('A simple addition test')
    .Given('I have numbers {int} and {int}', (initialNum, num1, num2) => [initialNum, num1, num2])
    .When('I add the numbers', sum)
    .Then('I get {int}', (summed, expectedResult) => {
      expect(summed).toBe(expectedResult);
    });
});
```

Some things to note:
- **Backgrounds** do not require a `name`
  - `Background()` will match all **Backgrounds** in the feature file.
  - `Background('My background')` will match only `'My background'`
- **Backgrounds** only support `Given()` and `Given().And().And()` steps
- The state returned from the last step of a **Background** will supply all **Scenarios** in the **Feature**
- **Scenario** can be provided an initial state generic


### Tables

To use tables defined in your Gherkin, do this:

```ts
import { Feature, IGherkinTableParam } from 'fermenter';

Feature('./features/calculator.feature', ({ Scenario, }) => {
  Scenario('A simple addition test')
    .Given('I have the following numbers:', (state = {}, table: IGherkinTableParam) => {
      const [{ a, b }] = table.rows.mapByTop();

      return {
        ...state,
        a: parseInt(a, 10),
        b: parseInt(b, 10),
      };
    });
});
```

- See the `IGherkinTableParam` type for more methods
- Try running the table test for more info: [src/lib/\_\_tests\_\_/GherkinTableReader.spec.ts](src/lib/__tests__/GherkinTableReader.spec.ts)

### Scenario Outlines

**Scenario Outlines** function just like **Scenarios**, but are run for each provided example in the `.feature`.

```ts
Feature('./test.feature', ({ ScenarioOutline }) => {
  ScenarioOutline('My outline')
    .When('foo is {string}')
});
```

See the **Scenario** section for more info.

### Global hooks

You may utilize this global hook to instrument or alter your steps and their state:

```ts
import { globallyBeforeEachStep } from 'fermenter';

globallyBeforeEachStep((step, state) => {
  console.log({
    stepName: step.name,
    scenarioName: step.definition.name,
    incomingState: state,
  });

  return state; // You can change this
});
```

### Typescript tips

The above is a simple example. Your **Background** state type will likely be quite large and you shouldnt have to manually define a type! We can use features from TS 3.0 to help here, and some types included in **Fermenter**.

This time, lets infer the type of the background:

```ts
import { Feature, AsyncReturnType } from 'fermenter';
import { delay } from 'bluebird';
import { sum } from 'lodash';

/** Lets also make this function async! */
async function initialNumberStep (state: undefined, initialNum: number) {
  await delay(500);

  return initialNum;
};

Feature('./features/calculator.feature', ({ Scenario, Background }) => {
  Background()
    .Given('I start with {int}', initialNumberStep)

  /** We have to tell TypeScript what the background return type is */
  Scenario<AsyncReturnType<typeof initialNumberStep>>('A simple addition test')
    .Given('I have numbers {int} and {int}', (initialNum, num1, num2) => [initialNum, num1, num2])
    .When('I add the numbers', sum)
    .Then('I get {int}', (summed, expectedResult) => {
      expect(summed).toBe(expectedResult);
    });
});
```

Yay, we didn't have to define any plumbing types!

Notes:
- The first **Scenario**'s **Given** will be run after the **Background** is complete
- Using `AsyncReturnType` allows one to retrieve the promisified (or not) return value of any function

### Using other test runners

To set your own test runner, pass its test methods when configuring a feature:

```ts
Feature({
  feature: '...',
  methods: { test, afterAll, beforeAll, describe }
}, () => {})

// or

/** Here we wrap `Feature` and give it the global variables mocha provides as test methods */
export const MochaFeature = (...args: Parameters<typeof Feature>) =>
  Feature(
    { methods: { test, describe, afterAll: after, beforeAll: before  }, ...args[0] },
    args[1]
  )
```

The framework has been tested in **Mocha**, **Jest** and **Cypress** but is expected to work with any which satisfy the test runner method interfaces.


## How it works

### Coming from CucumberJS

If you're coming from **CucumberJS** then some functionality is carried over:
- Same gherkin parser
- Same expression parser

### How it runs

- **Scenarios** and **ScenarioOutlines** are executed with fresh `state`
  - **There is no `this`**
  - `state` is reduced with each step function
  - **Strong TypeScript support** for step `state`
    - Steps will inherit the `state` type of the previous step return value
    - You shouldn't need to manually define types for step functions used inline
- **Step names are no longer restricted to be unique** for every feature file.
  - To reuse a step, simply reuse the function itself
- **Tests serve as a composition root**. No magic happens inside this library.
- Tests are executed by your test runner, which defaults to **Jest**
- Steps are executed in **synchronous** order.
- **Background** steps are executed before **Scenario** steps
- **Features** can be run asynchronously depending on your runner (as they are file-separated)
  - Each **Scenario** will also be run **synchronously** after another for a given `Feature()` definition
    - This is the default in **Jest**
  - It is possible to define multiple `Feature()` calls to the same `.feature` file within many `.test.ts` files, which can allow the same feature to be run in parallel inside **Jest** for example.

--------------------

## More info

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CHANGELOG.md](./CHANGELOG.md)
