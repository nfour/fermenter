# Gherkin Framework `WIP`

When it's done you'll be able to do something like this:

```ts
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
    .When('I multiply the numbers', multiplyNumbers)
    .Then('I get {int}', checkResult);

  ScenarioOutline('A simple subtraction test')
    .Given('I have numbers {int} and {int}', getNumbers)
    .When('I subtract the numbers', subtractNumbers)
    .Then('I get {int}', checkResult);
});
```

See:
- [src/tests/calculator.framework.test.ts](src/tests/calculator.framework.test.ts)
- [src/tests/features/calculator.feature](src/tests/features/calculator.feature)
