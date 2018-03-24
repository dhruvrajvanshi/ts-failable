"use strict";
/**
 * Test cases for failable
 */
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var ts_failable_1 = require("./ts-failable");
var chai_1 = require("chai");
describe("failable", function () {
    it("should create success values correctly", function () {
        var result = ts_failable_1.failable(function () { return ts_failable_1.success(10); });
        result.match({
            success: function (value) { return chai_1.expect(value).to.equal(10); },
            failure: function () { throw "Shoudn't happen"; }
        });
    });
    it("should create failure values correctly", function () {
        var result = ts_failable_1.failable(function () { return ts_failable_1.failure("FAILURE"); });
        result.match({
            success: function () { throw "Shouldn't happen "; },
            failure: function (err) { return chai_1.expect(err).to.equal("FAILURE"); }
        });
    });
    it("should chain correctly", function () {
        var f1 = function (s) { return ts_failable_1.failable(function (_a) {
            var failure = _a.failure;
            if (s) {
                return ts_failable_1.success(s);
            }
            else {
                return failure("NOT_FOUND");
            }
        }); };
        var f2 = function (s) { return ts_failable_1.failable(function (_a) {
            var failure = _a.failure;
            var num = parseInt(s);
            if (!num || num === NaN) {
                return failure("NOT_A_NUMBER");
            }
            else {
                return ts_failable_1.success(num);
            }
        }); };
        ts_failable_1.failable(function (_a) {
            var run = _a.run;
            run(f1(undefined));
            throw "Control flow should never reach here because f1 fails on undefined.";
        });
        ts_failable_1.failable(function (_a) {
            var run = _a.run;
            var str = run(f1("some_string"));
            chai_1.expect(str).to.equal("some_string");
            run(f2(str));
            throw "Control flow shouldn't reach here.";
        });
        ts_failable_1.failable(function (_a) {
            var run = _a.run;
            var str = run(f1("10"));
            chai_1.expect(str).to.equal("10");
            var num = run(f2(str));
            chai_1.expect(num).to.equal(10);
            return ts_failable_1.success(0);
        });
        var f3 = function (s) { return ts_failable_1.failable(function (_a) {
            var run = _a.run;
            var r1 = run(f1(s));
            var r2 = run(f2(r1));
            return ts_failable_1.success(r2);
        }); };
        chai_1.expect(f3(undefined)).to.deep.equal(ts_failable_1.failure("NOT_FOUND"));
        chai_1.expect(f3("asdf")).to.deep.equal(ts_failable_1.failure("NOT_A_NUMBER"));
        chai_1.expect(f3("12")).to.deep.equal(ts_failable_1.success(12));
        var r = f3(undefined);
        if (r.result.isError) {
            chai_1.expect(r.result.error).to.equal("NOT_FOUND");
        }
        else {
            throw new Error("Unexpectedly reached branch");
        }
    });
});
describe("failableAsync", function () {
    it("should create success values correctly", function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ts_failable_1.failableAsync(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, ts_failable_1.success(10)];
                    }); }); })];
                case 1:
                    result = _a.sent();
                    result.match({
                        success: function (value) { return chai_1.expect(value).to.equal(10); },
                        failure: function () { throw "Shoudn't happen"; }
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should create failure values correctly", function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ts_failable_1.failableAsync(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, ts_failable_1.failure("FAILURE")];
                    }); }); })];
                case 1:
                    result = _a.sent();
                    result.match({
                        success: function () { throw "Shouldn't happen"; },
                        failure: function (err) { return chai_1.expect(err).to.equal("FAILURE"); }
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should chain correctly", function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var f1, f2, f3, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    f1 = function (s) { return ts_failable_1.failableAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (s) {
                                return [2 /*return*/, ts_failable_1.success(s)];
                            }
                            else {
                                return [2 /*return*/, ts_failable_1.failure("NOT_FOUND")];
                            }
                            return [2 /*return*/];
                        });
                    }); }); };
                    f2 = function (s) { return ts_failable_1.failableAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                        var num;
                        return __generator(this, function (_a) {
                            num = parseInt(s);
                            if (!num || num === NaN) {
                                return [2 /*return*/, ts_failable_1.failure("NOT_A_NUMBER")];
                            }
                            else {
                                return [2 /*return*/, ts_failable_1.success(num)];
                            }
                            return [2 /*return*/];
                        });
                    }); }); };
                    return [4 /*yield*/, ts_failable_1.failableAsync(function (_a) {
                            var run = _a.run;
                            return __awaiter(_this, void 0, void 0, function () {
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _b = run;
                                            return [4 /*yield*/, f1(undefined)];
                                        case 1:
                                            _b.apply(void 0, [_c.sent()]);
                                            throw "Control flow should never reach here because f1 fails on undefined.";
                                    }
                                });
                            });
                        })];
                case 1:
                    _d.sent();
                    return [4 /*yield*/, ts_failable_1.failableAsync(function (_a) {
                            var run = _a.run;
                            return __awaiter(_this, void 0, void 0, function () {
                                var str, _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _b = run;
                                            return [4 /*yield*/, f1("some_string")];
                                        case 1:
                                            str = _b.apply(void 0, [_d.sent()]);
                                            chai_1.expect(str).to.equal("some_string");
                                            _c = run;
                                            return [4 /*yield*/, f2(str)];
                                        case 2:
                                            _c.apply(void 0, [_d.sent()]);
                                            throw "Control flow shouldn't reach here.";
                                    }
                                });
                            });
                        })];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, ts_failable_1.failableAsync(function (_a) {
                            var run = _a.run;
                            return __awaiter(_this, void 0, void 0, function () {
                                var str, _b, num, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _b = run;
                                            return [4 /*yield*/, f1("10")];
                                        case 1:
                                            str = _b.apply(void 0, [_d.sent()]);
                                            chai_1.expect(str).to.equal("10");
                                            _c = run;
                                            return [4 /*yield*/, f2(str)];
                                        case 2:
                                            num = _c.apply(void 0, [_d.sent()]);
                                            chai_1.expect(num).to.equal(10);
                                            return [2 /*return*/, ts_failable_1.success(0)];
                                    }
                                });
                            });
                        })];
                case 3:
                    _d.sent();
                    f3 = function (s) { return ts_failable_1.failableAsync(function (_a) {
                        var run = _a.run;
                        return __awaiter(_this, void 0, void 0, function () {
                            var r1, _b, r2, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _b = run;
                                        return [4 /*yield*/, f1(s)];
                                    case 1:
                                        r1 = _b.apply(void 0, [_d.sent()]);
                                        _c = run;
                                        return [4 /*yield*/, f2(r1)];
                                    case 2:
                                        r2 = _c.apply(void 0, [_d.sent()]);
                                        return [2 /*return*/, ts_failable_1.success(r2)];
                                }
                            });
                        });
                    }); };
                    _a = chai_1.expect;
                    return [4 /*yield*/, f3(undefined)];
                case 4:
                    _a.apply(void 0, [_d.sent()]).to.deep.equal(ts_failable_1.failure("NOT_FOUND"));
                    _b = chai_1.expect;
                    return [4 /*yield*/, f3("asdf")];
                case 5:
                    _b.apply(void 0, [_d.sent()]).to.deep.equal(ts_failable_1.failure("NOT_A_NUMBER"));
                    _c = chai_1.expect;
                    return [4 /*yield*/, f3("12")];
                case 6:
                    _c.apply(void 0, [_d.sent()]).to.deep.equal(ts_failable_1.success(12));
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("mapMultiple", function () {
    var f = function (arg) { return ts_failable_1.failable(function (_a) {
        var success = _a.success, failure = _a.failure;
        if (arg > 5) {
            return success((arg - 5).toString());
        }
        else {
            return failure(null);
        }
    }); };
    it("succeeds when all elements return success", function () {
        var validArray = [6, 7, 10, 8];
        var expectedArray = validArray.map(function (x) { return x - 5; }).map(function (x) { return x.toString(); });
        chai_1.expect(ts_failable_1.mapMultiple(validArray, f).result).to.deep.equal({
            isError: false,
            value: expectedArray
        });
    });
    it("fails when one element fails", function () {
        var validArray = [6, 7, 3, 8];
        chai_1.expect(ts_failable_1.mapMultiple(validArray, f).result).to.deep.equal({
            isError: true,
            error: null
        });
    });
});
//# sourceMappingURL=ts-failable.test.js.map