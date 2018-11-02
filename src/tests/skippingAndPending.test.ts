import { Feature } from '../';

Feature('./features/skippingAndPending.feature', ({ Scenario }) => {
  const fn = jest.fn();

  Scenario('I can pass a regular test')
    .When('it passes in the test framework', fn);

  Scenario.skip('I can skip a test so it does not execute')
    .Then('it is skipped in the test framework', fn);

  Scenario('This test isnt tested and should be considered pending');

  afterAll(() => {
    if (fn.mock.calls.length !== 1) { process.exit(1); }
  });
});
