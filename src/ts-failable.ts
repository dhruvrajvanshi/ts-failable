/**
 * Type that represents a failable computation. Is parametrized
 * over the result type and the error type.
 */
export interface IFailable<Result, Error> {
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
  flatMap<R2, E2 extends Error = Error>(
    f: (r: Result) => IFailable<R2, E2>
  ): IFailable<R2, Error | E2>;
}

/**
 * Type that represents a failure result. This is not
 * a part of the exported API and isn't actually exported
 * directly. Depend on {@link IFailable} instead.
 * @private
 */
class Failure<R, E> implements IFailable<R, E> {
  public readonly isError: true = true;
  constructor(public readonly error: E) {
  }

  public map<R2>(_: (r: R) => R2): IFailable<R2, E> {
    // tslint:disable-next-line:no-any
    return <any>this;
  }

  public mapError<E2>(func: (e: E) => E2): Failure<R, E2> {
    return new Failure(func(this.error));
  }

  public flatMap<R2, E2 extends E = E>(_: (r: R) => IFailable<R2, E2>): IFailable<R2, E2> {
    // tslint:disable-next-line:no-any
    return <any>this;
  }

  public match<T>(cases: IFailableMatchCase<T, R, E>): T {
    return cases.failure(this.error);
  }
}
export interface IFailableMatchCase<T, R, E> {
  failure(e: E): T;
  success(v: R): T;
}

/**
 * Type that represents a success result.  This is not
 * a part of the exported API and isn't actually exported
 * directly. Depend on {@link IFailable} instead.
 * @private
 */
class Success<R, E> implements IFailable<R, E> {
  public readonly isError: false = false;
  constructor(public readonly result: R) {
  }
  public map<R2>(func: (r: R) => R2): IFailable<R2, E> {
    return new Success(func(this.result));
  }

  public flatMap<R2, E2 extends E = E>(func: (r: R) => IFailable<R2, E2>): IFailable<R2, E2> {
    return func(this.result).match<IFailable<R2, E2>>({
      success: value => new Success<R2, E2>(value),
      failure: e => new Failure<R2, E2>(e)
    });
  }

  public mapError<E2>(_: (r: E) => E2): IFailable<R, E2> {
    // tslint:disable-next-line:no-any
    return <any>this;
  }

  public match<T>(cases: IFailableMatchCase<T, R, E>): T {
    return cases.success(this.result);
  }
}

export type FailablePromise<T, E> = Promise<IFailable<T, E>>;

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
export async function failableAsync<T = never, E = never>(
  f: (
    (arg: {
      success(value: T): Promise<IFailable<T, E>>;
      failure(error: E): Promise<IFailable<T, E>>;
      run<R>(f: IFailable<R, E>): R;
    }) => Promise<IFailable<T, E>>
  )
): Promise<IFailable<T, E>> {
  try {
    return await f({
      success(value) {
        return Promise.resolve(new Success<T, E>(value));
      },
      failure(e) {
        return Promise.resolve(new Failure<T, E>(e));
      },
      run(result) {
        return result.match({
          failure: error => { throw new ErrorValue(error); },
          success: value => value
        });
      }
    });
  } catch (e) {
    if (e instanceof ErrorValue) {
      return e.value;
    } else {
      throw e;
    }
  }
}

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
export function failable<T, E = never>(
  f: (
    (arg: {
      /**
       * Make IFailable<T, E> from a T
       * @param value
       */
      success(value: T): IFailable<T, E>;
      failure(error: E): IFailable<T, E>;
      run<R>(f: IFailable<R, E>): R;
    }) => IFailable<T, E>
  )
): IFailable<T, E> {
  try {
    return f({
      success(value) {
        return new Success<T, E>(value);
      },
      failure(e) {
        return new Failure<T, E>(e);
      },
      run(result) {
        return result.match({
          failure: error => { throw new ErrorValue(error); },
          success: value => value
        });
      }
    });
  } catch (e) {
    if (e instanceof ErrorValue) {
      return new Failure(e.value);
    } else {
      throw e;
    }
  }
}

/**
 * Container for a value of type T. Used to distinguish expections
 * thrown by failable from other exceptions.
 * This is for internal use only. It's not exported. Don't depend
 * on its behaviour.
 * @private
 */
class ErrorValue<T> {
  constructor(public readonly value: T) {}
}
