export function mapToObject<Y = any> (map: Map<string, Y>) {
  return [...map.entries()]
    .reduce((o, [k, v]) => ({ ...o, [k]: v }), <{ [k: string]: Y }> {});
}

export type IDeferredPromise<T = any> = Promise<T> & { resolve: () => void };

export function deferredPromise<T> (): IDeferredPromise<T> {
  let resolver: () => any;

  const promise = <IDeferredPromise<T>> new Promise<T>((resolve) => resolver = resolve);
  promise.resolve = resolver!;

  return promise;
}
