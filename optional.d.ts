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
 *
 * You need to extract the value at the end by calling .valueOf.
 * Obviously, you'd run into problems if your type contains
 * a .valueOf property.
 * The way this type works is it makes all nullable/undefined properties
 * along the path non nullable and it turns all the "leaf" level properties
 * into nullable.
 * Leaf level properties are the types which are primitive
 * (string | number | boolean | symbol).
 * The so, if you have a deeply nested value .a.b.c.z: string,
 * you'd access it as .a.b.c.z.valueOf(), which will give you
 * a `string | null`. It will be null in case any value along
 * the path is null/undefined.
 * Note that leaf level properties which are optional (i.e. `T | undefined`),
 * they would be converted to `T | null` by `.valueOf`.
 */
export declare type IOptional<T> = {
    /**
     * This is a phantom type parameter that ensures
     * that objects created outside this module are
     * not assignable to IOptional<T>.
     * This has no runtime significance
     * Optional.of uses a type cast to make an
     * {@link IOptional}
     */
    ___ts_failable_optional___: never;
    valueOf(): T | null;
} & T extends string | number | boolean | symbol ? {
    ___ts_failable_optional___: never;
    valueOf(): NonNullable<T> | null;
} : {
    [K in keyof T]-?: IOptional<T[K]>;
};
export declare const Optional: {
    of<T>(t: T): IOptional<T>;
};
