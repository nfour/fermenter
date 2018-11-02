import { Feature } from '../';

Feature('./features/skippingWithOnly.feature', ({ Scenario }) => {
  Scenario('This shouldnt run')
    .Then('it does not run', () => 1);

  Scenario.only('This is the only test that should run')
    .Then('it runs', () => 1);

  Scenario('This also shouldnt run')
    .Then('it does not run', () => 1);
});
