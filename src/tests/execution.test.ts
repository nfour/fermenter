import { Feature } from '..';

Feature('./features/execution.feature', ({ Scenario, AfterAll }) => {
  Scenario('Failing steps exit a scenario gracefully')
    .Given('A step which passes', () => 1)
    .When('This step fails', () => {
      throw new Error('Expected this');
    })
    .Then(`This step's function should not execute`, () => {
      throw new Error('Do not expect this');
    });

});
