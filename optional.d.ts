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
export declare type IOptional<T> = {
    valueOf(): T | null;
} & T extends string | number | boolean | symbol ? {
    valueOf(): T | null;
} : {
    [K in keyof T]-?: IOptional<T[K]>;
};
export declare const Optional: {
    of<T>(t: T): IOptional<T>;
};
