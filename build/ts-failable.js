"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Type that represents a failure result. This is not
 * a part of the exported API and isn't actually exported
 * directly. Depend on {@link IFailable} instead.
 * @private
 */
var Failure = /** @class */ (function () {
    function Failure(error) {
        this.error = error;
        this.isError = true;
    }
    Failure.prototype.map = function (_) {
        // tslint:disable-next-line:no-any
        return this;
    };
    Failure.prototype.mapError = function (func) {
        return new Failure(func(this.error));
    };
    Failure.prototype.flatMap = function (_) {
        // tslint:disable-next-line:no-any
        return this;
    };
    Failure.prototype.match = function (cases) {
        return cases.failure(this.error);
    };
    return Failure;
}());
/**
 * Type that represents a success result.  This is not
 * a part of the exported API and isn't actually exported
 * directly. Depend on {@link IFailable} instead.
 * @private
 */
var Success = /** @class */ (function () {
    function Success(result) {
        this.result = result;
        this.isError = false;
    }
    Success.prototype.map = function (func) {
        return new Success(func(this.result));
    };
    Success.prototype.flatMap = function (func) {
        return func(this.result).match({
            success: function (value) { return new Success(value); },
            failure: function (e) { return new Failure(e); }
        });
    };
    Success.prototype.mapError = function (_) {
        // tslint:disable-next-line:no-any
        return this;
    };
    Success.prototype.match = function (cases) {
        return cases.success(this.result);
    };
    return Success;
}());
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
function failableAsync(f) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, f({
                            success: function (value) {
                                return Promise.resolve(new Success(value));
                            },
                            failure: function (e) {
                                return Promise.resolve(new Failure(e));
                            },
                            run: function (result) {
                                return result.match({
                                    failure: function (error) { throw new ErrorValue(error); },
                                    success: function (value) { return value; }
                                });
                            }
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    e_1 = _a.sent();
                    if (e_1 instanceof ErrorValue) {
                        return [2 /*return*/, e_1.value];
                    }
                    else {
                        throw e_1;
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.failableAsync = failableAsync;
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
function failable(f) {
    try {
        return f({
            success: function (value) {
                return new Success(value);
            },
            failure: function (e) {
                return new Failure(e);
            },
            run: function (result) {
                return result.match({
                    failure: function (error) { throw new ErrorValue(error); },
                    success: function (value) { return value; }
                });
            }
        });
    }
    catch (e) {
        if (e instanceof ErrorValue) {
            return new Failure(e.value);
        }
        else {
            throw e;
        }
    }
}
exports.failable = failable;
/**
 * Create an error {@link IFailable} value.
 * @param err Error value
 */
function failure(err) {
    return new Failure(err);
}
exports.failure = failure;
/**
 * Create a successful {@link IFailable} value
 * @param value Result value
 */
function success(value) {
    return new Success(value);
}
exports.success = success;
/**
 * Container for a value of type T. Used to distinguish expections
 * thrown by failable from other exceptions.
 * This is for internal use only. It's not exported. Don't depend
 * on its behaviour.
 * @private
 */
var ErrorValue = /** @class */ (function () {
    function ErrorValue(value) {
        this.value = value;
    }
    return ErrorValue;
}());
//# sourceMappingURL=ts-failable.js.map