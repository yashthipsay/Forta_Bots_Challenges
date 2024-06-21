"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestHelper = exports.MockProvider = void 0;
var MockProvider_1 = require("./MockProvider");
var MockProvider_2 = require("./MockProvider");
Object.defineProperty(exports, "MockProvider", { enumerable: true, get: function () { return MockProvider_2.MockProvider; } });
var TestHelper = /** @class */ (function () {
    function TestHelper() {
    }
    TestHelper.createL1Provider = function (chainId, l1Balance) {
        return new MockProvider_1.MockProvider(chainId, l1Balance, "");
    };
    TestHelper.createL2Provider = function (chainId, l2Supply) {
        return new MockProvider_1.MockProvider(chainId, "", l2Supply);
    };
    return TestHelper;
}());
exports.TestHelper = TestHelper;
