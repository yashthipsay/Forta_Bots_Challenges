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
var contracts_1 = require("@ethersproject/contracts");
var forta_agent_1 = require("forta-agent");
var constants_1 = require("./constants");
var ethers_1 = require("ethers");
var mockAlerts_1 = require("./mockAlerts");
var findings_1 = require("./findings");
var Helper = /** @class */ (function () {
    function Helper(provider) {
        this.provider = provider;
    }
    Helper.prototype.getL1Balance = function (address, blockNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var L1Contract, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        L1Contract = new contracts_1.Contract(constants_1.DAI_ADDRESS, [constants_1.ESCROW_ABI], this.provider);
                        return [4 /*yield*/, L1Contract.balanceOf(address, { blockTag: blockNumber })];
                    case 1:
                        balance = _a.sent();
                        return [2 /*return*/, balance];
                }
            });
        });
    };
    Helper.prototype.getL2Supply = function (blockNumber, chainId, findings) {
        return __awaiter(this, void 0, void 0, function () {
            var l2ChainContract, totalSupply, l1Alerts, l1Balance, l2Network, l2BigNumber, l1BigNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        l2ChainContract = new contracts_1.Contract(constants_1.DAI_L2_ADDRESS, constants_1.L2_ABI, this.provider);
                        return [4 /*yield*/, l2ChainContract.totalSupply({ blockTag: blockNumber })];
                    case 1:
                        totalSupply = _a.sent();
                        return [4 /*yield*/, (0, mockAlerts_1.getMockAlerts)(blockNumber)];
                    case 2:
                        l1Alerts = _a.sent();
                        l2BigNumber = forta_agent_1.ethers.BigNumber.from(totalSupply);
                        l1BigNumber = ethers_1.BigNumber;
                        if (chainId == 10) {
                            l1Balance = l1Alerts.alerts[0].metadata.optEscBal;
                            l2Network = "Optimism";
                            l1BigNumber = forta_agent_1.ethers.BigNumber.from(l1Balance);
                            console.log(l1Balance);
                            if (l1BigNumber.lt(l2BigNumber)) {
                                findings.push((0, findings_1.createFinding)(l1Balance, l2BigNumber.toString(), l2Network));
                            }
                        }
                        else {
                            l1Balance = l1Alerts.alerts[0].metadata.abtEscBal;
                            console.log(l1Balance);
                            l2Network = "Arbitrum";
                            l1BigNumber = ethers_1.BigNumber.from(l1Balance);
                            if (l1BigNumber.lt(l2BigNumber)) {
                                findings.push((0, findings_1.createFinding)(l1Balance, l2BigNumber.toString(), "Optimism"));
                            }
                        }
                        return [2 /*return*/, totalSupply];
                }
            });
        });
    };
    return Helper;
}());
exports.default = Helper;
