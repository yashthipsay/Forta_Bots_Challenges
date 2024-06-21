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
exports.provideTransaction = void 0;
// Importing necessary modules and constants
var forta_agent_1 = require("forta-agent");
var forta_agent_2 = require("forta-agent");
var constants_1 = require("./constants");
// Function to handle transactions related to bot creation and update
function provideTransaction(botCreation, botUpdate, botDeployedAddress, botUpdateEvent, nethermindDeployerAddress) {
    return function handleTransaction(tx) {
        return __awaiter(this, void 0, void 0, function () {
            var finding, botCreationAlert, botUpdateAlert, _i, botCreationAlert_1, creationAlert, address, botDeployedChecksumAddress, type, network, _a, botUpdateAlert_1, updateAlert, address, botDeployedChecksumAddress, type, network;
            return __generator(this, function (_b) {
                finding = [];
                botCreationAlert = tx.filterFunction(botCreation, botDeployedAddress);
                botUpdateAlert = tx.filterFunction(botUpdate, botDeployedAddress);
                // Loop through each bot creation alert
                for (_i = 0, botCreationAlert_1 = botCreationAlert; _i < botCreationAlert_1.length; _i++) {
                    creationAlert = botCreationAlert_1[_i];
                    address = tx.from;
                    botDeployedChecksumAddress = forta_agent_2.ethers.utils.getAddress(nethermindDeployerAddress);
                    type = tx.type;
                    network = tx.network;
                    // If the transaction is from the deployer address, add a finding
                    if (address.toLowerCase() === nethermindDeployerAddress.toLowerCase()) {
                        finding.push(forta_agent_1.Finding.fromObject({
                            name: "Bot Creation",
                            description: "Bot created",
                            alertId: "BOT-1",
                            severity: forta_agent_1.FindingSeverity.Low,
                            type: forta_agent_1.FindingType.Info,
                            metadata: {
                                // address,
                                botDeployedAddress: botDeployedAddress,
                            },
                        }));
                    }
                }
                for (_a = 0, botUpdateAlert_1 = botUpdateAlert; _a < botUpdateAlert_1.length; _a++) {
                    updateAlert = botUpdateAlert_1[_a];
                    address = tx.from;
                    botDeployedChecksumAddress = forta_agent_2.ethers.utils.getAddress(nethermindDeployerAddress);
                    type = tx.type;
                    network = tx.network;
                    // If the transaction is from the deployer address, add a finding
                    if (address.toLowerCase() === nethermindDeployerAddress.toLowerCase()) {
                        finding.push(forta_agent_1.Finding.fromObject({
                            name: "Bot Updating",
                            description: "Bot updated",
                            alertId: "BOT-2",
                            severity: forta_agent_1.FindingSeverity.Low,
                            type: forta_agent_1.FindingType.Info,
                            metadata: {
                                // address,
                                botDeployedAddress: botDeployedAddress,
                            },
                        }));
                    }
                }
                return [2 /*return*/, finding];
            });
        });
    };
}
exports.provideTransaction = provideTransaction;
exports.default = {
    // initialize,
    handleTransaction: provideTransaction(constants_1.CREATE_BOT_FUNCTION, constants_1.UPDATE_BOT_FUNCTION, constants_1.BOT_DEPLOYED_ADDRESS, constants_1.BOT_UPDATE_EVENT, constants_1.NETHERMIND_DEPLOYER_ADDRESS),
};
