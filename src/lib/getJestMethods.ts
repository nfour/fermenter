import { ITestMethods } from '../GherkinTest';

export function getJestMethods (): ITestMethods {
  return { describe, beforeAll, afterAll, test };
}
