import { Feature } from '../';

Feature('./features/skippingAndPending.feature', ({ Scenario }) => {
  Scenario('I can pass a regular test')
    .When('it passes in the test framework', () => 1);

  Scenario.skip('I can skip a test so it does not execute')
    .Then('it is skipped in the test framework', () => 1);

  Scenario('This test isnt tested and should be considered pending');
});
