"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var test_1 = require("forta-agent-tools/lib/test");
var forta_agent_1 = require("forta-agent");
var agent_1 = require("./agent");
var bignumber_1 = require("@ethersproject/bignumber");
var constants_1 = require("./constants");
var findings_1 = require("./findings");
var forta_agent_2 = require("forta-agent");
var TEST_VAL1 = {
    OPT_ESCROW_ADDRESS: constants_1.OPT_ESCROW_ADDRESS,
    OPT_ESCROW_VALUE: bignumber_1.BigNumber.from("100"),
    ABT_ESCROW_ADDRESS: constants_1.ABT_ESCROW_ADDRESS,
    ABT_ESCROW_VALUE: bignumber_1.BigNumber.from("400"),
    OPT_L2_BAL: bignumber_1.BigNumber.from("500"),
    ABT_L2_BAL: bignumber_1.BigNumber.from("600"),
    BOT_ID: "0x1908ef6008007a2d4a3f3c2aa676832bbc42f747a54dbce88c6842cfa8b18612",
};
var TEST_VAL2 = {
    OPT_ESCROW_ADDRESS: constants_1.OPT_ESCROW_ADDRESS,
    OPT_ESCROW_VALUE: bignumber_1.BigNumber.from("500"),
    ABT_ESCROW_ADDRESS: constants_1.ABT_ESCROW_ADDRESS,
    ABT_ESCROW_VALUE: bignumber_1.BigNumber.from("400"),
    OPT_L2_BAL: bignumber_1.BigNumber.from("100"),
    ABT_L2_BAL: bignumber_1.BigNumber.from("100"),
};
var mockAlertResponse = {
    alerts: [
        {
            metadata: {
                OptEscrBal: TEST_VAL1.OPT_ESCROW_VALUE,
                AbtEscrBal: TEST_VAL1.ABT_ESCROW_VALUE
            },
        },
    ],
    pageInfo: {
        hasNextPage: false,
        endCursor: {
            aertId: "L1 Escrow Supply",
            blockNumber: 10,
        },
    }
};
jest.mock("./mockAlerts", function () { return ({
    getL1Alerts: function () { return mockAlertResponse; },
}); });
var L1_IFACE = new forta_agent_1.ethers.utils.Interface([constants_1.ESCROW_ABI]);
var L2_IFACE = new forta_agent_1.ethers.utils.Interface([constants_1.L2_ABI]);
var MakeMockCall = function (mockProvider, id, inp, outp, addr, intface, block) {
    mockProvider.addCallTo(addr, block, intface, id, {
        inputs: inp,
        outputs: outp
    });
};
function getMockAlerts(botId, optEscrowBal) {
    return __awaiter(this, void 0, void 0, function () {
        var alerts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, forta_agent_2.getAlerts)({
                        botIds: [botId],
                        addresses: [constants_1.OPT_ESCROW_ADDRESS, constants_1.ABT_ESCROW_ADDRESS],
                    })];
                case 1:
                    alerts = _a.sent();
                    return [2 /*return*/, alerts];
            }
        });
    });
}
describe("Dai bridge 11-12 solvency check", function () {
    var handleBlock;
    var mockProvider;
    var provider;
    beforeEach(function () {
        mockProvider = new test_1.MockEthersProvider();
        provider = mockProvider;
        handleBlock = (0, agent_1.provideHandleBlock)(provider);
    });
    it("returns no finding if the optimism layer 2 dai supply is less than the layer 1 escrow dai balance", function () { return __awaiter(void 0, void 0, void 0, function () {
        var blockEvent, findings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blockEvent = (0, forta_agent_1.createBlockEvent)({
                        block: {
                            hash: "0xa",
                            number: 10
                        },
                    });
                    mockProvider.addCallTo(constants_1.DAI_L2_ADDRESS, 10, L2_IFACE, "totalSupply", {
                        inputs: [],
                        outputs: [TEST_VAL1.OPT_ESCROW_VALUE]
                    });
                    console.log('Mocked call to totalSupply:', constants_1.DAI_L2_ADDRESS, 10, L2_IFACE, "totalSupply", {
                        inputs: [],
                        outputs: [TEST_VAL1.OPT_ESCROW_VALUE]
                    });
                    mockProvider.setNetwork(10);
                    return [4 /*yield*/, handleBlock(blockEvent)];
                case 1:
                    findings = _a.sent();
                    console.log('Findings:', findings);
                    expect(findings.length).toEqual(0);
                    expect(findings).toStrictEqual([]);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns a findings for layer one escrows when on the eth network", function () { return __awaiter(void 0, void 0, void 0, function () {
        var blockEvent, findings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blockEvent = (0, forta_agent_1.createBlockEvent)({
                        block: { hash: "0xa", number: 10 }
                    });
                    mockProvider
                        .addCallTo(constants_1.DAI_ADDRESS, 10, L1_IFACE, "balanceOf", {
                        inputs: [TEST_VAL1.OPT_ESCROW_ADDRESS],
                        outputs: [TEST_VAL1.OPT_ESCROW_VALUE],
                    })
                        .addCallTo(constants_1.DAI_ADDRESS, 10, L1_IFACE, "balanceOf", {
                        inputs: [TEST_VAL1.ABT_ESCROW_ADDRESS],
                        outputs: [TEST_VAL1.ABT_ESCROW_VALUE],
                    });
                    mockProvider.setNetwork(1);
                    return [4 /*yield*/, handleBlock(blockEvent)];
                case 1:
                    findings = _a.sent();
                    expect(findings).toEqual([(0, findings_1.createL1OptFinding)(TEST_VAL1.OPT_ESCROW_VALUE.toString()), (0, findings_1.createL1AbtFinding)(TEST_VAL1.ABT_ESCROW_VALUE.toString())]);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns no finding if the Arbitrum layer 2 dai supply is less than arbitrum escrow balance", function () { return __awaiter(void 0, void 0, void 0, function () {
        var blockEvent, findings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blockEvent = (0, forta_agent_1.createBlockEvent)({
                        block: { hash: "0xa", number: 10 },
                    });
                    mockProvider.addCallTo(constants_1.DAI_L2_ADDRESS, 10, L2_IFACE, "totalSupply", {
                        inputs: [],
                        outputs: [TEST_VAL2.ABT_L2_BAL],
                    });
                    mockProvider.setNetwork(42161);
                    return [4 /*yield*/, handleBlock(blockEvent)];
                case 1:
                    findings = _a.sent();
                    expect(findings.length).toEqual(0);
                    expect(findings).toStrictEqual([]);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns a finding if optimism l2 supply is more than L1 escrow balance", function () { return __awaiter(void 0, void 0, void 0, function () {
        var blockEvent, findings, expectedFindings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blockEvent = (0, forta_agent_1.createBlockEvent)({
                        block: { hash: "0xa", number: 10 },
                    });
                    mockProvider.addCallTo(constants_1.DAI_L2_ADDRESS, 10, L2_IFACE, "totalSupply", {
                        inputs: [],
                        outputs: [TEST_VAL1.OPT_L2_BAL],
                    });
                    mockProvider.setNetwork(10);
                    console.log(TEST_VAL1.OPT_L2_BAL + "  " + TEST_VAL1.OPT_ESCROW_VALUE);
                    return [4 /*yield*/, handleBlock(blockEvent)];
                case 1:
                    findings = _a.sent();
                    expectedFindings = (0, findings_1.createFinding)(TEST_VAL1.OPT_ESCROW_VALUE.toString(), TEST_VAL1.OPT_L2_BAL.toString(), "Optimism");
                    expect(findings.length).toEqual(1);
                    expect(findings).toStrictEqual([expectedFindings]);
                    return [2 /*return*/];
            }
        });
    }); });
});
