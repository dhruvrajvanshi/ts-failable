/**
 * Type that represents a failable computation. Is parametrized
 * over the result type and the error type.
 */
export interface IFailable<Result, Error> {
    /**
     * Return an object containing the result of
     * the computation from which the value or error
     * can be extracted using .isError check.
     * Useful as an alternative to .match
     *
     * @example
     * ```
     *
     * const failable: IFailable<number, string> = ...;
     * if (failable.result.isError) {
     *   // .error can be accessed inside this block
     *   console.log(failable.result.error);
     * } else {
     *   // .value can be accessed inside this block
     *   console.log(failable.result.value);
     * }
     * ```
     */
    result: IFailableResult<Result, Error>;
    /**
     * Transform an {@link IFailable}<R, E> into an {@link IFailable}<R2, E>
     * by applying the given function to the result value in
     * case of success. Has no effect in case this is a failure.
     * @param f Function that transforms a success value.
     *
     * @example
     * ```
     *
     * const numStr: Failable<string, string> = ...;
     * const parsed: Failable<number, string> = numStr.map(parseInt); // or numStr.map(s => parseInt(s))
     * ```
     */
    map<R2>(f: (r: Result) => R2): IFailable<R2, Error>;
    /**
     * Transform the error value of an {@link IFailable} using the
     * given function. Has no effect if the {@link IFailable} was
     * a success.
     * @param f Function for transforming the error value
     *
     * @example
     * ```
     *
     * const result: Failable<number, string> = ...;
     * const withErrorCode: Failable<number, number> = result.mapError(getErrorCode)
     * ```
     */
    mapError<E2>(f: (e: Error) => E2): IFailable<Result, E2>;
    /**
     * Pattern match over this IFailable by supplying
     * a success and failure functions. Both cases
     * must return a value of type T
     * @param cases Match cases
     *
     * @example
     * ```
     *
     * const result: Failable<number, string> = ...;
     * const num = result.match({
     *   success: x => x,
     *   failure: err => {
     *     console.log(err);
     *     return 0;
     *   }
     * }); // num = x if result was successful, otherwise 0
     * ```
     */
    match<T>(cases: IFailableMatchCase<T, Result, Error>): T;
    /**
     * Chain another computation to this IFailable that
     * takes the result value of this IFailable and returns
     * a new IFailable (possibly of a different type).
     * The chained computation must be an IFailable whose error
     * type is a subset of this IFailable's error type.
     * If not, you can call .mapError on it to convert it's
     * error into a type compatible with this IFailable.
     *
     * This method allows you to chain arbitrary failable computations
     * dependent on the results of previous ones in the chain that
     * "short circuit" in case of the first error.
     *
     * @param f Function that takes the success value of this
     * IFailable and returns another IFailable (possibly of another
     * type)
     *
     * @example
     * ```
     *
     * const computation1: () => Failable<number, ERROR> = ...;
     * const computation2: (x: int) => Failable<string, ERROR> = ...;
     * const result: Failable<string, ERROR> = computation1().flatMap(x => computation2(x))
     * ```
     */
    flatMap<R2, E2 extends Error = Error>(f: (r: Result) => IFailable<R2, E2>): IFailable<R2, Error | E2>;
}
/**
 * Discriminated union for an {@link IFailable} result.
 * value or error can be extracted from it using an
 * `if (r.isError)` check
 */
export declare type IFailableResult<T, E> = {
    isError: true;
    error: E;
} | {
    isError: false;
    value: T;
};
/**
 * Argument type of .match method on an {@link IFailbale}.
 * It takes an object containing two callbacks; One for
 * success and failure case.
 * The value returned by these callbacks should be the
 * same type.
 */
export interface IFailableMatchCase<T, R, E> {
    /**
     * Callback that is run in case of failure.
     * It is passed the error value of the result.
     */
    failure: (e: E) => T;
    /**
     * Callback that is called in case of success.
     * It is passed the success value of the result.
     */
    success: (v: R) => T;
}
export declare type FailablePromise<T, E> = Promise<IFailable<T, E>>;
export declare type FailableAsyncFunctionParams<T, E> = {
    success(value: T): Promise<IFailable<T, E>>;
    failure(error: E): Promise<IFailable<T, E>>;
    run<R>(f: IFailable<R, E>): R;
};
export declare type FailableAsyncArg<T, E> = ((arg: FailableAsyncFunctionParams<T, E>) => Promise<IFailable<T, E>>);
/**
 * Async version of failable that takes a computation that
 * returns a Promise<Failable<T, E>>. It can be combined with
 * async/await
 *
 * @example
 * ```
 *
 * const computation1: () => FailablePromise<string, string> = ...;
 * const computation2: (x: string) => FailablePromise<number, string> = ...;
 * const computation3: (x: number) => Failable<number, string> = ...;
 * const computation4 = failableAsync<number, string>(async ({ run, success, failure }) => {
 *   const str = run(await computation1());
 *   const num1 = run(await computation2(str));
 *
 *   // notice that computation3 returns a non async failable so await isn't required
 *   const num = run(computation3(num1));
 *   if (num > 10) {
 *     return success(num);
 *   } else {
 *     return failure("Number too small");
 *   }
 * })
 * ```
 */
export declare function failableAsync<T, E>(f: FailableAsyncArg<T, E>): Promise<IFailable<T, E>>;
export declare type FailableArgParams<T, E> = {
    /**
     * Make IFailable<T, E> from a T
     * @param value
     */
    success(value: T): IFailable<T, E>;
    failure(error: E): IFailable<T, E>;
    run<R>(f: IFailable<R, E>): R;
};
export declare type FailableArg<T, E> = ((arg: FailableArgParams<T, E>) => IFailable<T, E>);
/**
 * Creates a failable comutation from a function.
 * The supplied function receives an object containing
 * helper functions to create IFailable values. You
 * need to give generic arguments T and E to it indicating
 * the success and failure types.
 *
 * @param f Failable computation
 *
 * @example
 * ```
 *
 * const computation1: () => Failable<string, string> = ...;
 * const computation2: (x: string) => Failable<number, string> = ...;
 * const computation3 = failable<number, string>(({ run, success, failure }) => {
 *   const str = run(computation1());
 *   const num = run(computation2(str));
 *   if (num > 10) {
 *     return success(num);
 *   } else {
 *     return failure("Number too small");
 *   }
 * })
 * ```
 */
export declare function failable<T, E>(f: FailableArg<T, E>): IFailable<T, E>;
/**
 * Create an error {@link IFailable} value.
 * @param err Error value
 */
export declare function failure<T, E>(err: E): IFailable<T, E>;
/**
 * Create a successful {@link IFailable} value
 * @param value Result value
 */
export declare function success<T, E>(value: T): IFailable<T, E>;
/**
 * Helper type for an async function that
 * takes Req and returns a {@link FailablePromise}<Res, Err>.
 */
export declare type AsyncFunction<Req, Res, Err> = (req: Req) => FailablePromise<Res, Err>;
/**
 * Take an array of elements and apply a failable computations to
 * the array, returning an IFailable of items.
 * @param arr Array of values
 * @param f Function that takes an item of the given array
 * and returns an IFailable<T, E>
 */
export declare function mapM<T, E>(arr: T[], f: (t: T) => IFailable<T, E>): IFailable<T[], E>;
