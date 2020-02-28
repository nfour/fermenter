export type IDeferredPromise<T = any> = Promise<T> & { resolve: () => any };

export function deferredPromise<T> (): IDeferredPromise<T> {
  let resolver: undefined | (() => any);

  const promise = <IDeferredPromise<T>> new Promise<T>((resolve) => resolver = resolve);
  promise.resolve = resolver!;

  return promise;
}
