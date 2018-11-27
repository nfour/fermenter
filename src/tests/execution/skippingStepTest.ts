import { Feature } from '../..';

Feature('./execution.feature', ({ Scenario }) => {
  Scenario('Steps are skipped when their function is omitted')
    .Then('this test should be skipped')
    .And.skip('this test should also be skipped');
});
