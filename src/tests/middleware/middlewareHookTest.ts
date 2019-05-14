import { Feature } from '../../';

Feature('./middleware.feature', ({ Scenario }) => {
  Scenario('I have a scenario')
    .Given('Something is set', () => {
      return { something: true };
    })
    .Then('Check if Something is true', (state) => {
      expect(state.something).toBe(true);
    });
});
