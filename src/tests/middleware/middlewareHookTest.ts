import { Feature, globallyBeforeEachStep } from '../../';

globallyBeforeEachStep((step, state) => {
  const isRightStep = step.name === 'Something is set by a middleware';
  const isInRightScenario = step.definition.name === 'I have a scenario';

  if (isRightStep && isInRightScenario) {
    return 'banana';
  }

  return state;
});

globallyBeforeEachStep((step, state) => {
  return state === 'banana' ? 'chicken' : state;
});

Feature('./middleware.feature', ({ Scenario }) => {
  Scenario('I have a scenario')
    .Given('Something is set by a middleware', (initialSomething: 'chicken') => {
      return { something: initialSomething };
    })
    .Then('Check that Something is true', (state) => {
      expect(state.something).toBe('chicken');
    });
});
