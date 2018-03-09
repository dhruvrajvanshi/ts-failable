ts-failable
===========

This is a library for type safe error handling in Typescript.
If you've ever wished for Rust's `Result` type along with
the syntactic sugar (`?` operator) in Typescript, you might
find this useful. 

## Why
In Typescript, there's no way to check the type of exceptions
that a function can throw at compile time. When you catch an exception,
you get a value of type `any`. You can encode a result type `Either`/`Result`
type like Haskell or Rust that can either be a success value or failure value.
Unlike Haskell and Rust, Typescript doesn't have special syntax to make chaining
of `Result` values easier.

This library helps in reducing the boilerplate related to error handling in
a type safe manner. Think of it like `async/await` syntax for error handling.
If you're familiar with Haskell or Scala, you know this as `do` notation or
`for/yield` syntax both of which allow you to chain failable computations
without nesting using `flatMap` or `>>=`.

In short, instead of this

```ts
let result = computation1()
  .flatMap(r1 =>
    computation2(r1)
      .flatMap(r2 => computation3(r1, r2))
  )
```

We would like to write this

```ts
let r1 = run(computation1());
let r2 = run(computation2(r1));
let r3 = run(computation3(r1, r2))
```

## Installation

```
npm install ts-failable
```

Any failure in an intermediate step should short circuit the
whole thing. This is the entire point of this library.

## Usage
We'll walk through a simple function named getNumber that takes
an optional string and returns a number if the string is present,
contains an integer and the integer is greater than 10.
If any of these conditions fail, it should return a description
of the error.

Start with importing a few things

```ts
import { Failable, failable } from "ts-failable";
```

Lets start with defining types for each of our failure cases.

```ts
type NOT_FOUND = {
  type: "NOT_FOUND"
}
type NOT_A_NUMBER = {
  type: "NOT_A_NUMBER";
  str: string;
}
type TOO_SMALL = {
  type: "TOO_SMALL";
  value: number;
}
```

Our function would can throw one of these error types so let's
name the error type of our function.

```ts
type GetNumberError = NOT_FOUND | NOT_A_NUMBER | TOO_SMALL;
```

Our function needs to take a `string | undefined` argument and
needs to return something that will have a `number` in case all
the conditions are met, or a `GetNumberError`. This can be encoded
in `ts-failure` by `IFailable<number, GetNumberError>`.

Our function is really small but it has three distinct steps.
To demonstrate chaining, I'll make each step as a seperate function.

```ts
const getString = (str: string | undefined) =>
  failable<string, NOT_FOUND>(({ success, failure }) => {
    if (str !== undefined) {
      return success(str);
    } else {
      return failure({ type: NOT_FOUND });
    }
  });

const parseInteger = (str: string) =>
  failable<number, NOT_A_NUMBER>(({ success, failure }) => {
    const num = parseInt(str);
    if (num === NaN) {
      return failure({
        type: NOT_A_NUMBER,
        str: str
      });
    } else {
      return success(num);
    }
  });
```

```ts
const getNumber = (optionalString: string | undefined) =>
  failable<number, GetNumberError>(({ success, failure, run }) => {
    const str = run(getString(optionalString));
    const num = run(parseInteger(str));
    if (num < 10) {
      return failure({
        type: TOO_SMALL,
        value: num
      });
    } else {
      return success(num);
    }
  })
```

You can see that `getNumber` doesn't need to check for error at each step.
It run will propagate the intermediate errors upwards just like exceptions.

Run will only accept computations whose failure type is a subtype of the
current context's failure type so you have to declare downstream failures
in the type.

To handle an IFailable<T, E>, you can use `.match` method to pattern match
on the result.

```ts
const logError = (err: GetNumberError) => {
  if (err.type === "NOT_FOUND") {
    console.log("Value not found");
  } else if (err.type === "NOT_A_NUMBER") {
    console.log(`Expected ${err.str} to be a number.`);
  } else {
    console.log(`${err.value} is greater than 10`);
  }
};

const num = getNumber("10").match({
  success:value => value,
  failure:err => {
    logError(err);
    return 0;
  }
});
```

`.match` needs 2 functions that handle both success and failure cases.
The `success` function receives the successful value of the computation
and `failure` receives the error object that was thrown. The result type
of both the functions must be the same.

### Async
The the library exposes another function `failableAsync` that is useful
for running asynchronous functions. If the intermediate steps in the previous
example were asynchronous and returned promises, we could've written it like this.

```ts
import { failableAsync } from "ts-failable";

const getNumber = (optionalString: string | undefined) =>
  failableAsync<number, GetNumberError>(async ({ success, failure, run }) => {
    const str = run(await getString(optionalString));
    const num = run(await parseInteger(str));
    if (num < 10) {
      return failure({
        type: TOO_SMALL,
        value: num
      });
    } else {
      return success(num);
    }
  })
```
Only three things have been changed here.
1. `failable` -> `failableAsync`
2. Added `async` keyword to the argument function.
3. Added `await` in front of arguments to `run` that return
  `FailablePromise`.

`FailablePromise<T, E>` is a type alias defined as.

```ts
type FailablePromise<T, E> = Promise<IFailable<T, E>>;
```

While dealing with APIs that deal with Promises and exceptions, you can wrap
the functions that return Promises into FailablePromise returning functions
like this.

```ts
type DB_ERROR = {
  type: "DB_ERROR";
  error: any; // or whatever the type of error your DB driver returns
}

const query = (q: string) =>
  failableAsync<Row[], DB_ERROR>(async ({ success, failure }) => {
    try {
      const rows = await db.query(q); // or whatever your DB driver exposes
      return success(rows);
    } catch (e) {
      return failure({
        type: "DB_ERROR",
        error: e
      });
    }
  })
```

Now, you can use the query function in any `failableAsync` context
while ensuring that DB_ERROR is either handled by the caller or
is propagated upwards.
