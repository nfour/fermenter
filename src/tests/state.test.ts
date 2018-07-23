import { Feature } from '..';

Feature('./features/state.feature', ({ Scenario, Background }) => {
  const expectedState = { a: 1 };

  Background()
    .Given('I have some state', () => expectedState);

  Scenario('I can inherit state from background')
    .Then('the state matches', (state) => {
      expect(state).toEqual(expectedState);
    });

  const scenarioExpectedState = { x: 1 };

  Scenario('I can create new state for a scenario')
    .Given('I have some state', () => scenarioExpectedState)
    .Then('the state matches', (state) => {
      expect(state).toEqual(scenarioExpectedState);
    });
});
