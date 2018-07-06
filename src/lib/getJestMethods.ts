import { afterAll, beforeAll, describe, test } from 'jest-circus';
import { ITestMethods } from '../GherkinTest';

export function getJestMethods (): ITestMethods {
  return { describe, beforeAll, afterAll, test };
}
