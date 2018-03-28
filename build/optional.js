"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-reserved-keywords
var VALUE_OF = "valueOf";
// tslint:disable-next-line:no-any
var nullProxy = new Proxy({}, {
    get: function (_, key) {
        if (key === VALUE_OF) {
            return function () { return null; };
        }
        return nullProxy;
    }
});
var optionalProxyHandler = {
    // tslint:disable-next-line:no-any
    get: function (self, prop) {
        if (prop === VALUE_OF) {
            // tslint:disable-next-line:no-unsafe-any
            return self[prop];
        }
        // tslint:disable-next-line:no-unsafe-any
        var value = self[prop];
        if (value === null || value === undefined) {
            return nullProxy;
        }
        else {
            return makeOptional(value);
        }
    }
};
// tslint:enable:no-reserved-keywords
function makeOptional(x) {
    if (x === null || x === undefined) {
        // tslint:disable-next-line:no-unsafe-any
        return nullProxy;
    }
    if (typeof x === "object") {
        // @ts-ignore
        var proxy = new Proxy(x, optionalProxyHandler);
        // tslint:disable-next-line:no-any
        return proxy;
    }
    else {
        return x;
    }
}
exports.Optional = {
    // tslint:disable:no-reserved-keywords
    of: function (t) {
        return makeOptional(t);
    }
};
//# sourceMappingURL=optional.js.map