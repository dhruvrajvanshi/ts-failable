/**
 * Optional type wrapper that uses proxies for
 * short curcuiting evaluation of deeply nested
 * nullable properties. This is something like
 * elvis operator in Swift/Kotlin/Rust where
 * you can write
 * ```kotlin
 * if (a.b?.c == null) { ... }
 * ```
 *
 * @example
 * ```
 *
 * type T = { x?: { y?: { z?: number } } }
 *
 * const t = Optional.make<T>({});
 * console.log(x.y.z.valueOf()); // null
 * console.log(x.y.valueOf()); // null
 *
 * const t1 = Optional.of({
 *   x: {
 *     y: {
 *       z: 10
 *     }
 *   }
 * })
 * console.log(x.y.z.valueOf()); // 10
 * ```
 */
export type IOptional<T> =
  {
    valueOf(): T | null;
  } &
  T extends string | number | boolean | symbol
    ? {
      valueOf(): T | null;
    }
    : {
      [K in keyof T]-?:
        IOptional<T[K]>
    };

// tslint:disable:no-reserved-keywords
const VALUE_OF = "valueOf";
// tslint:disable-next-line:no-any
const nullProxy: any = new Proxy({}, {
  get(_, key: string) {
    if (key === VALUE_OF) {
      return () => null;
    }

    return nullProxy;
  }
});

const optionalProxyHandler = {

  // tslint:disable-next-line:no-any
  get(self: any, prop: string) {

    if (prop === VALUE_OF) {
      // tslint:disable-next-line:no-unsafe-any
      return self[prop];
    }

    // tslint:disable-next-line:no-unsafe-any
    const value = self[prop];
    if (value === null || value === undefined) {
      return nullProxy;
    } else {
      return makeOptional(value);
    }
  }
};
// tslint:enable:no-reserved-keywords

function makeOptional<T>(x: T): IOptional<T> {
  if (x === null || x === undefined) {
    // tslint:disable-next-line:no-unsafe-any
    return nullProxy;
  }
  if (typeof x === "object") {
    // @ts-ignore
    const proxy = new Proxy(x, optionalProxyHandler);

    // tslint:disable-next-line:no-any
    return <any>proxy;
  } else {
    return x;
  }
}

export const Optional = {
  // tslint:disable:no-reserved-keywords
  of<T>(t: T) {
    return makeOptional(t);
  }
};
