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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("forta-agent-tools/lib/test");
var forta_agent_1 = require("forta-agent");
var agent_1 = require("./agent");
var utils_1 = require("./utils");
var retrieval_1 = __importDefault(require("./retrieval"));
var forta_agent_tools_1 = require("forta-agent-tools");
var forta_agent_2 = require("forta-agent");
var handleTransaction;
var Iface = new forta_agent_2.ethers.utils.Interface(utils_1.UNISWAP_PAIR_ABI);
describe("Uniswap test suite", function () {
    var mockProvider = new test_1.MockEthersProvider();
    var txEvent;
    var mockToken1 = (0, forta_agent_tools_1.createAddress)("0x987");
    var mockFee = 99206;
    var mockPoolAddress;
    var retrieval = new retrieval_1.default(mockProvider);
    mockPoolAddress = retrieval.getUniswapPairCreate2Address((0, forta_agent_tools_1.createAddress)("0x284"), (0, forta_agent_tools_1.createAddress)("0x765"), mockToken1, 99206, utils_1.COMPUTED_INIT_CODE_HASH);
    var mockSwapEventArgs = [
        (0, forta_agent_tools_1.createAddress)("0x234"),
        (0, forta_agent_tools_1.createAddress)("0x345"),
        forta_agent_2.ethers.BigNumber.from("5378335736229591174395"),
        forta_agent_2.ethers.BigNumber.from("266508884993980604"),
        forta_agent_2.ethers.BigNumber.from("555620238891309147094159455"),
        forta_agent_2.ethers.BigNumber.from("14900188386820019615173"),
        99206,
    ];
    var mockSwapEventArgs2 = [
        (0, forta_agent_tools_1.createAddress)("0x284"),
        (0, forta_agent_tools_1.createAddress)("0x567"),
        forta_agent_2.ethers.BigNumber.from("1000000000000000000"),
        forta_agent_2.ethers.BigNumber.from("500000000000000000"),
        forta_agent_2.ethers.BigNumber.from("600000000000000000000000000"),
        forta_agent_2.ethers.BigNumber.from("20000000000000000000000"),
        99206,
    ];
    // Describe block groups test cases together
    beforeAll(function () {
        handleTransaction = (0, agent_1.provideSwapHandler)((0, forta_agent_tools_1.createAddress)("0x284"), utils_1.COMPUTED_INIT_CODE_HASH, mockProvider);
    });
    var createUniswapPairCalls = function (pairAddress, functionName, output, blockNumber) {
        mockProvider.addCallTo(pairAddress, blockNumber, Iface, functionName, {
            inputs: [],
            outputs: [output],
        });
    };
    // It returns a single finding if there is a single valid swap event from Uniswap
    it("returns a finding if there is a single valid swap event from Uniswap", function () { return __awaiter(void 0, void 0, void 0, function () {
        var findings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createUniswapPairCalls(mockPoolAddress, "token0", (0, forta_agent_tools_1.createAddress)("0x765"), 0);
                    createUniswapPairCalls(mockPoolAddress, "token1", mockToken1, 0);
                    createUniswapPairCalls(mockPoolAddress, "fee", mockFee, 0);
                    txEvent = new test_1.TestTransactionEvent();
                    txEvent
                        .setBlock(0)
                        .addEventLog("event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", mockPoolAddress, [
                        mockSwapEventArgs[0],
                        mockSwapEventArgs[1],
                        mockSwapEventArgs[2],
                        mockSwapEventArgs[3],
                        mockSwapEventArgs[4],
                        mockSwapEventArgs[5],
                        mockSwapEventArgs[6],
                    ]);
                    return [4 /*yield*/, handleTransaction(txEvent).then(function (findings) {
                            expect(findings.length).toStrictEqual(1);
                            expect(findings).toStrictEqual([
                                forta_agent_1.Finding.fromObject({
                                    name: "Uniswap V3 Swap Detector",
                                    description: "This Bot detects the Swaps executed on Uniswap V3",
                                    alertId: "UNISWAP_SWAP_EVENT",
                                    severity: forta_agent_1.FindingSeverity.Info,
                                    type: forta_agent_1.FindingType.Info,
                                    protocol: "UniswapV3",
                                    metadata: {
                                        token0: (0, forta_agent_tools_1.createAddress)("0x765"),
                                        token1: mockToken1,
                                        fee: mockFee.toString(),
                                    },
                                }),
                            ]);
                        })];
                case 1:
                    findings = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // It returns multiple findings for multiple valid swap events from Uniswap
    it("returns multiple findings for multiple valid swap events from Uniswap", function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockPoolAddress2, findings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockPoolAddress2 = retrieval.getUniswapPairCreate2Address((0, forta_agent_tools_1.createAddress)("0x999"), (0, forta_agent_tools_1.createAddress)("0x888"), (0, forta_agent_tools_1.createAddress)("0x456"), 99206, utils_1.COMPUTED_INIT_CODE_HASH);
                    createUniswapPairCalls(mockPoolAddress2, "token0", (0, forta_agent_tools_1.createAddress)("0x888"), 0);
                    createUniswapPairCalls(mockPoolAddress2, "token1", (0, forta_agent_tools_1.createAddress)("0x456"), 0);
                    createUniswapPairCalls(mockPoolAddress2, "fee", mockFee, 0);
                    // Add the second swap event to the transaction event
                    txEvent
                        .addEventLog("event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", mockPoolAddress2, [
                        mockSwapEventArgs2[0],
                        mockSwapEventArgs2[1],
                        mockSwapEventArgs2[2],
                        mockSwapEventArgs2[3],
                        mockSwapEventArgs2[4],
                        mockSwapEventArgs2[5],
                        mockSwapEventArgs2[6],
                    ])
                        .addEventLog("event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", mockPoolAddress, [
                        mockSwapEventArgs[0],
                        mockSwapEventArgs[1],
                        mockSwapEventArgs[2],
                        mockSwapEventArgs[3],
                        mockSwapEventArgs[4],
                        mockSwapEventArgs[5],
                        mockSwapEventArgs[6],
                    ]);
                    return [4 /*yield*/, handleTransaction(txEvent).then(function (findings) {
                            expect(findings.length).toStrictEqual(2); // Expecting two findings now
                            expect(findings).toEqual([
                                forta_agent_1.Finding.fromObject({
                                    name: "Uniswap V3 Swap Detector",
                                    description: "This Bot detects the Swaps executed on Uniswap V3",
                                    alertId: "UNISWAP_SWAP_EVENT",
                                    severity: forta_agent_1.FindingSeverity.Info,
                                    type: forta_agent_1.FindingType.Info,
                                    protocol: "UniswapV3",
                                    metadata: {
                                        token0: (0, forta_agent_tools_1.createAddress)("0x765"),
                                        token1: mockToken1,
                                        fee: mockFee.toString(),
                                    },
                                }),
                                forta_agent_1.Finding.fromObject({
                                    name: "Uniswap V3 Swap Detector",
                                    description: "This Bot detects the Swaps executed on Uniswap V3",
                                    alertId: "UNISWAP_SWAP_EVENT",
                                    severity: forta_agent_1.FindingSeverity.Info,
                                    type: forta_agent_1.FindingType.Info,
                                    protocol: "UniswapV3",
                                    metadata: {
                                        token0: (0, forta_agent_tools_1.createAddress)("0x765"),
                                        token1: (0, forta_agent_tools_1.createAddress)("0x987"),
                                        fee: mockFee.toString(),
                                    },
                                }),
                            ]);
                        })];
                case 1:
                    findings = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns zero findings for events other than swap events from Uniswap", function () { return __awaiter(void 0, void 0, void 0, function () {
        var findings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Create a mock event that is not a swap event
                    // Use a different event signature to simulate a non-swap event
                    txEvent = new test_1.TestTransactionEvent()
                        .setBlock(0)
                        .addEventLog("event Transfer(address indexed from, address indexed to, uint256 value)", mockPoolAddress, [
                        mockSwapEventArgs[0],
                        mockSwapEventArgs[1],
                        mockSwapEventArgs[2],
                    ]);
                    return [4 /*yield*/, handleTransaction(txEvent).then(function (findings) {
                            expect(findings.length).toStrictEqual(0); // Expecting zero findings
                        })];
                case 1:
                    findings = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns zero findings for multiple non-swap events", function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockNonSwapEventArgs2, findings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockNonSwapEventArgs2 = [(0, forta_agent_tools_1.createAddress)("0x789"), (0, forta_agent_tools_1.createAddress)("0x890"), forta_agent_2.ethers.BigNumber.from("2000")];
                    // Add a second non-swap event to the transaction event
                    txEvent
                        .setBlock(0)
                        .addEventLog("event Approval(address indexed owner, address indexed spender, uint256 value)", (0, forta_agent_tools_1.createAddress)("0xdef"), [mockNonSwapEventArgs2[0], mockNonSwapEventArgs2[1], mockNonSwapEventArgs2[2]])
                        .addEventLog("event Transfer(address indexed from, address indexed to, uint256 value)", mockPoolAddress, [
                        mockSwapEventArgs[0],
                        mockSwapEventArgs[1],
                        mockSwapEventArgs[2],
                    ]);
                    return [4 /*yield*/, handleTransaction(txEvent).then(function (findings) {
                            expect(findings.length).toStrictEqual(0); // Expecting zero findings for both non-swap events
                        })];
                case 1:
                    findings = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
