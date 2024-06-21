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
var forta_agent_1 = require("forta-agent");
var abi_1 = require("@ethersproject/abi");
var agent_1 = require("./agent");
var forta_agent_tools_1 = require("forta-agent-tools");
var test_1 = require("forta-agent-tools/lib/test");
var constants_1 = require("./constants");
// Test suite for the bot creation agent
describe("bot creation agent", function () {
    var handleTransaction;
    var args = [1, (0, forta_agent_tools_1.createAddress)("0x02"), "Mock tx 2", [137]];
    var mockUpdateAgentEventData2 = [1, "Mock tx 2", [137]];
    var mockBotDeployedAddress = constants_1.BOT_DEPLOYED_ADDRESS;
    var mockNethermindAddress = constants_1.NETHERMIND_DEPLOYER_ADDRESS;
    var mockCreateBotFunction = constants_1.CREATE_BOT_FUNCTION;
    var mockUpdateBotFunction = constants_1.UPDATE_BOT_FUNCTION;
    var OTHER_FUNCTION_ABI = "function otherFunction(uint256 agentId, address, string metadata, uint256[] chainIds)";
    // Setup for the tests
    beforeAll(function () {
        handleTransaction = (0, agent_1.provideTransaction)(constants_1.CREATE_BOT_FUNCTION, constants_1.UPDATE_BOT_FUNCTION, constants_1.BOT_DEPLOYED_ADDRESS, constants_1.BOT_UPDATE_EVENT, constants_1.NETHERMIND_DEPLOYER_ADDRESS);
    });
    // Test suite for the handleTransaction function
    describe("handleTransaction", function () {
        var provideInterface = new abi_1.Interface([
            constants_1.CREATE_BOT_FUNCTION,
            constants_1.UPDATE_BOT_FUNCTION,
            OTHER_FUNCTION_ABI,
        ]);
        // Test for bot creation
        it("should find created bot", function () { return __awaiter(void 0, void 0, void 0, function () {
            var tx, expectedFinding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = new test_1.TestTransactionEvent()
                            .setTo(constants_1.BOT_DEPLOYED_ADDRESS)
                            .setFrom(constants_1.NETHERMIND_DEPLOYER_ADDRESS)
                            .addTraces({
                            function: provideInterface.getFunction("createAgent"),
                            to: mockBotDeployedAddress,
                            from: mockNethermindAddress,
                            arguments: args,
                        });
                        return [4 /*yield*/, handleTransaction(tx)];
                    case 1:
                        expectedFinding = _a.sent();
                        expect(expectedFinding).toEqual([
                            forta_agent_1.Finding.fromObject({
                                name: "Bot Creation",
                                protocol: "ethereum",
                                description: "Bot created",
                                alertId: "BOT-1",
                                severity: forta_agent_1.FindingSeverity.Low,
                                // timestamp: new Date(),
                                // toString: [Function],
                                type: forta_agent_1.FindingType.Info,
                                metadata: {
                                    // address: mockNethermindAddress,
                                    botDeployedAddress: mockBotDeployedAddress,
                                },
                                addresses: [],
                                labels: [],
                                uniqueKey: "",
                                source: {},
                            }),
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        // Test for bot update
        it("should find updated bot", function () { return __awaiter(void 0, void 0, void 0, function () {
            var tx, expectedFinding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = new test_1.TestTransactionEvent()
                            .setTo(constants_1.BOT_DEPLOYED_ADDRESS)
                            .setFrom(constants_1.NETHERMIND_DEPLOYER_ADDRESS)
                            .addTraces({
                            function: provideInterface.getFunction("updateAgent"),
                            to: mockBotDeployedAddress,
                            from: mockNethermindAddress,
                            arguments: mockUpdateAgentEventData2,
                        });
                        return [4 /*yield*/, handleTransaction(tx)];
                    case 1:
                        expectedFinding = _a.sent();
                        expect(expectedFinding).toEqual([
                            forta_agent_1.Finding.fromObject({
                                name: "Bot Updating",
                                protocol: "ethereum",
                                description: "Bot updated",
                                alertId: "BOT-2",
                                severity: forta_agent_1.FindingSeverity.Low,
                                type: forta_agent_1.FindingType.Info,
                                metadata: {
                                    botDeployedAddress: mockBotDeployedAddress,
                                },
                                addresses: [],
                                labels: [],
                                uniqueKey: "",
                                source: {},
                            }),
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        // Test for no findings for bot creation
        it("should not have any findings for bot creation", function () { return __awaiter(void 0, void 0, void 0, function () {
            var tx, findings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = new test_1.TestTransactionEvent()
                            .setTo(constants_1.BOT_DEPLOYED_ADDRESS)
                            .setFrom(constants_1.NETHERMIND_DEPLOYER_ADDRESS)
                            .addTraces({
                            function: provideInterface.getFunction("otherFunction"),
                            to: mockBotDeployedAddress,
                            from: mockNethermindAddress,
                            arguments: args,
                        });
                        return [4 /*yield*/, handleTransaction(tx)];
                    case 1:
                        findings = _a.sent();
                        expect(findings).toEqual([]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
