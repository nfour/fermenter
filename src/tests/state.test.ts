import { Feature } from '../';

Feature('./features/state.feature', ({ Scenario, Background }) => {
  const expectedState = { a: 1 };
  type IInitialState = typeof expectedState;

  Background()
    .Given('I have some state', (initialState: {}) => {
      return {
        ...initialState,
        ...expectedState,
      };
    })
    .And('I pass it to another step', (state) => state);

  Scenario<IInitialState>('I can inherit state from background')
    .Then('the state matches', (state) => {
      expect(state).toEqual(expectedState);
    });

  const scenarioExpectedState = { x: 1 };

  Scenario<IInitialState>('I can create new state for a scenario')
    .Given('I have some state', (initialState) => scenarioExpectedState)
    .Then('the state matches', (state) => {
      expect(state).toEqual(scenarioExpectedState);
    });
});
