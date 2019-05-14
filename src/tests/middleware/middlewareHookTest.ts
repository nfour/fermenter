import { Feature } from '../../';

Feature('./middleware.feature', ({ Scenario }) => {
  Scenario('I have a scenario')
    .Given('Something is set by a middleware', (initialSomething) => {
      return { something: initialSomething };
    })
    .Then('Check that Something is true', (state) => {
      expect(state.something).toBe(true);
    });
});
