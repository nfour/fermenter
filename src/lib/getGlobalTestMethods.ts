import { ITestMethods } from '../GherkinTest';

// These will be globals because of the runtime
export function getGlobalTestMethods (): ITestMethods {
  return { describe, beforeAll, afterAll, test };
}
