import { Feature } from '../..';

Feature('./execution.feature', ({ Scenario }) => {
  Scenario('Failing steps exit a scenario gracefully')
    .Given('A step which passes', () => 1)
    .When('This step fails', () => {
      throw new Error('Should error');
    })
    .Then(`This step's function should not execute`, () => {
      throw new Error('Shouldnt error');
    });
});
