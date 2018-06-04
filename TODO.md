# Todo

- [Todo](#todo)
  - [Tasks](#tasks)
  - [Framework](#framework)
    - [Programmatic API](#programmatic-api)
    - [Choosing how to use Gherkin](#choosing-how-to-use-gherkin)
      - [With .feature files](#with-feature-files)
      - [Just the Programmatic API](#just-the-programmatic-api)
    - [Reduced return value for each Scenario](#reduced-return-value-for-each-scenario)

## Tasks

- [ ] Framework
    - [ ] Programmatic API
        - [ ] Fluid interface
        - [ ] Reduced return value for each Scenario
    - [ ] Choosing how to use Gherkin

## Framework

We want Gherkin. It makes sense for BDD.

> **Why not CucumberJS**

CucumberJS means a whole bag of bad javascript and deviation away from the way we write all of our other tests.

Bad because:
- Mutative state
- Enforced directory structures
- Under the hood magic, difficulty reasoning about seperated steps and general test flow
- Cucumber runner is unknown. We require plugins to instrument everything, which already exists in Jest.
- Is not as performant as jest or concurrent
- Opinionated

Creating a minimal framework that honors Gherkin syntax (and thus our stories) seems to be the easiest solution.

### Programmatic API

The framework itself is necessary for mapping Gherkin to functions.

```ts
await t.Scenario(/A valid order qualifies on a valid ruleSet/)
  .Given(/I am authenticated/, authenticate)
  .And(/I have an experience with action '{action}'/, getExperience(t))
  .When(/I execute 'orderQualification' on order service/, async (state) => {
    return {
      ...state,
      order: await t.sdk.Orders.create({ /* */ }),
    };
  })
  .Then(/I expect to recieve a set of experience qualification sets/, () => {
    expect(state.order.body.included).toMatchObject([
      { type: 'i-forget-what-this-is' },
    ]);
  });
```

> The above employs regex to map to Gherkin, but without gherkin the use of regex would be unecessary and they would merely be naming strings.

Pros:
- Reads like Gherkin language, easier to understand at a glance
    - When code is folded, should be even more clear
- Supports procedural functional coding instead of the CucumberJS way of mutative world states and magic
- Single file to define entire test scenario, utilizing TypeScript to map up step functions and imports. The scope of the test is clear from a single entry file.

Cons:
- A new thing to learn (currently aims for a small scope, overlapping with Gherkin heavily)
- Possible steep learning curve for junior developers due to use of high order language concepts
  - Fluid interface
  - Factories
  - Currying
  - Reduced state eg. Redux

### Choosing how to use Gherkin

Should we:
- [ ] Use Gherkin .feature files and map them to the code using the framework?
- [ ] Use just the framework without feature files

#### With .feature files

```feature
Feature: As a merchant I can qualify an order for an experience

  Scenario: A valid order qualifies on a valid ruleSet
    Given I am authenticated
    Given I have an experience with action 'orderQualification'
    When I execute 'orderQualification' on order service
```


Pros:
- Logical entry point file to provide an overview of what is being tested
- Can be decoupled from tests implementing each scenario (1 feature file, 6 test file?)
- Can include tables of readable data
- A language most developers will know/can learn easily without having to know how to write tests
- Can intuitively utilize ScenarioOutlines and variables for generic step functions

Cons:
- Extra file to maintain and its relationship to tests
- Duplicating text between the test itself which must map functions up
- Questionable whether would be any more readable than the framework itself, as it reads the same roughly

#### Just the Programmatic API

Pros:
- Dont need to deal with the Gherkin file yay

Cons:
- Harder to make agnostic step functions (which work on many kinds of features), as where would the variables come from?
- Would have to support concept of defining support variables & scenario outlines as code

### Reduced return value for each Scenario

We can reduce the return value of each function under a `.Scenario` or `.ScenarioOutline` in order to provide an easy to way to pass state between functions in a procedural manner. This is like `redux`.

```ts
t.Scenario('foo')
  .Given('x is {y}', (state, { y }) => {
    console.log(state.y) // undefined

    return { ...state, y }
  })
  .When('set y is greater than 2', (state) => {
    expect(state.y).toBeGreaterThan(2)

    return state
  })
  .Then('do fancy stuff', fancyStuffDoerFromAnotherFileThatNowHasY)
```
