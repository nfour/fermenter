
// tslint:disable-next-line
export type Omit<T, K extends keyof T> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type AsyncReturnType<T extends (...args: any[]) => any> = UnwrapPromise<ReturnType<T>>;

export * from './fluid';
export * from './ast';
export * from './parser';
