import { Feature } from '../';

Feature('./features/skippingAndPending.feature', ({ Scenario }) => {
  Scenario('I can pass a regular test')
    .When('it passes in the test framework', () => 1);

  Scenario.pending('I can skip a test so it does not execute')
    .Then('it is skipped in the test framework', () => 1);

  Scenario.skip('I can declare a test pending, so that it will not execute')
    .Then('it is pending in the test framework', () => 1);
});
