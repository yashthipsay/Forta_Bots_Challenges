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
exports.provideHandleBlock = void 0;
var forta_agent_1 = require("forta-agent");
// import { JsonRpcProvider } from "ethers";
var findings_1 = require("./findings");
// import { getL1Alerts } from "./botAlerts";
var helper_1 = __importDefault(require("./helper"));
var constants_1 = require("./constants");
var emptyAlertResponse = {
    alerts: [],
    pageInfo: {
        hasNextPage: false,
    },
};
function provideHandleBlock(provider) {
    return function handleTransaction(blockEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var balance, findings, HelperInstance, chainId, optBalance, abtBalance, l2Cond, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        findings = [];
                        HelperInstance = new helper_1.default(provider);
                        return [4 /*yield*/, provider.getNetwork()];
                    case 1:
                        chainId = (_b.sent()).chainId;
                        if (!(chainId == 1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, HelperInstance.getL1Balance(constants_1.OPT_ESCROW_ADDRESS, blockEvent.blockNumber)];
                    case 2:
                        optBalance = _b.sent();
                        return [4 /*yield*/, HelperInstance.getL1Balance(constants_1.ABT_ESCROW_ADDRESS, blockEvent.blockNumber)];
                    case 3:
                        abtBalance = _b.sent();
                        findings.push((0, findings_1.createL1OptFinding)(optBalance));
                        findings.push((0, findings_1.createL1AbtFinding)(abtBalance));
                        _b.label = 4;
                    case 4:
                        if (!(chainId != 1)) return [3 /*break*/, 8];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, HelperInstance.getL2Supply(blockEvent.blockNumber, chainId, findings)];
                    case 6:
                        l2Cond = _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _a = _b.sent();
                        return [2 /*return*/, findings];
                    case 8: 
                    // else if (l1Alerts.alerts.length == 0) {
                    //   return findings;
                    // }
                    return [2 /*return*/, findings];
                }
            });
        });
    };
}
exports.provideHandleBlock = provideHandleBlock;
//   return findings;
// };
// // const initialize: Initialize = async () => {
// //   // do some initialization on startup e.g. fetch data
// // }
// // const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
// //   const findings: Finding[] = [];
// //   // detect some block condition
// //   return findings;
// // }
// // const handleAlert: HandleAlert = async (alertEvent: AlertEvent) => {
// //   const findings: Finding[] = [];
// //   // detect some alert condition
// //   return findings;
// // }
// // const healthCheck: HealthCheck = async () => {
// //   const errors: string[] = [];
//   // detect some health check condition
//   // errors.push("not healthy due to some condition")
//   // return errors;
// // }
exports.default = {
    // initialize,
    // handleTransaction,
    // healthCheck,
    // handleBlock,
    handleTransaction: provideHandleBlock((0, forta_agent_1.getEthersProvider)()),
};
// const l1Alerts: AlertsResponse = await getMockAlerts(blockEvent.blockNumber);
// if (chainId != 1) {
//   const balance = chainId === 42161 ? l1Alerts.alerts[0].metadata.l1Escrow : l1Alerts.alerts[0].metadata.optEscBal;
//   // const balance =
//   //   (chainId == 10)
//   //     ? await HelperInstance.getL1Balance(ABT_ESCROW_ADDRESS, blockEvent.blockNumber)
//   //     : await HelperInstance.getL1Balance(OPT_ESCROW_ADDRESS, blockEvent.blockNumber);
//   const totalL2Supply = await HelperInstance.getL2Supply(blockEvent.blockNumber, chainId);
//   console.log(balance);
//   if (balance < totalL2Supply) {
//     findings.push(
//       createFinding(balance, totalL2Supply, chainId.toString()),
//     );
//   }
// } else
