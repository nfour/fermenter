import { Feature } from '../..';

Feature('./execution.feature', ({ Scenario }) => {
  Scenario('Steps are skipped when their function is omitted')
    .When('this test should not be skipped', () => 1)
    .Then('this test should be skipped') // Skipped due to omition of fn
    .And('this test should not be skipped', () => 1);

  Scenario('Steps can be skipped explicitly with .skip')
    .When('this test should not be skipped', () => 1)
    .Then.skip('this test should be skipped', () => 1) // Skipped explicitly
    .And('this test should not be skipped', () => 1);
});
