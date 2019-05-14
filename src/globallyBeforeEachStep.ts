import { IGherkinStep } from './types';

export type IGlobalBeforeEachStepHook = (step: IGherkinStep, ...args: any[]) => any;

/** A singleton which stores callbacks provided to the `globallyBeforeEachStep` function */
export let globalBeforeEachStepHooks: IGlobalBeforeEachStepHook[] = [];

export function globallyBeforeEachStep (callback: IGlobalBeforeEachStepHook) {
  globalBeforeEachStepHooks = [...globalBeforeEachStepHooks, callback];
}
