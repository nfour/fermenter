import { Feature } from '../';

// TODO: Convert this test to match ./execution tests (in a shell with snaps)
Feature('./features/skippingWithOnly.feature', ({ Scenario }) => {
  const fn = jest.fn();

  Scenario('This shouldnt run')
    .Then('it does not run', fn);

  Scenario.only('This is the only test that should run')
    .Then('it runs', fn);

  Scenario('This also shouldnt run')
    .Then('it does not run', fn);

  afterAll(() => {
    if (fn.mock.calls.length !== 1) { process.exit(1); }
  });
});
