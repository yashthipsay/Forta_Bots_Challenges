"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createL1AbtFinding = exports.createL1OptFinding = exports.createFinding = void 0;
var forta_agent_1 = require("forta-agent");
var createFinding = function (l1Escrow, l2Supply, network) {
    return forta_agent_1.Finding.fromObject({
        name: "L1 Escrow has less balance than L2 supply on ".concat(network),
        description: "balance of ".concat(l1Escrow, ", ").concat(network, " l2Supply-> ").concat(l2Supply),
        alertId: "L2 INVARIANT",
        severity: forta_agent_1.FindingSeverity.High,
        type: forta_agent_1.FindingType.Exploit,
        protocol: "".concat(network),
        metadata: {
            l1Escrow: "".concat(l1Escrow),
            l2Supply: "".concat(l2Supply),
        },
    });
};
exports.createFinding = createFinding;
var createL1OptFinding = function (optEscBal) {
    return forta_agent_1.Finding.fromObject({
        name: "Total supply of Optimism escrow in L1 DAI",
        description: "Optimism L1 escrow balance: ".concat(optEscBal),
        alertId: "l1-escrow-supply",
        severity: forta_agent_1.FindingSeverity.Info,
        type: forta_agent_1.FindingType.Info,
        protocol: "Ethereum",
        metadata: {
            optEscBal: "".concat(optEscBal),
        },
    });
};
exports.createL1OptFinding = createL1OptFinding;
var createL1AbtFinding = function (abtEscBal) {
    return forta_agent_1.Finding.fromObject({
        name: "Total supply of Optimism escrow in L1 DAI",
        description: "Optimism L1 escrow balance: ".concat(abtEscBal),
        alertId: "l1-escrow-supply",
        severity: forta_agent_1.FindingSeverity.Info,
        type: forta_agent_1.FindingType.Info,
        protocol: "Ethereum",
        metadata: {
            abtEscBal: "".concat(abtEscBal),
        },
    });
};
exports.createL1AbtFinding = createL1AbtFinding;
