import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
  TransactionEvent,
} from "forta-agent";
import handleTransaction from "./agent";
import { createAddress } from "forta-agent-tools";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import {
  CREATE_BOT_FUNCTION,
  UPDATE_BOT_FUNCTION,
  BOT_CREATION_HOOK,
  BOT_DEPLOYED_ADDRESS,
  NETHERMIND_DEPLOYER_ADDRESS
} from "./constants";



describe("bot creation agent", ()=>{
  const mockBotDeployedAddress: string = BOT_DEPLOYED_ADDRESS;
const mockNethermindAddress: string = NETHERMIND_DEPLOYER_ADDRESS;
const mockCreateBotFunction: string = CREATE_BOT_FUNCTION;
const mockUpdateBotFunction: string = UPDATE_BOT_FUNCTION;
const mockBotCreationHook: string = BOT_CREATION_HOOK;

it('should find created bot', async () => {
const tx:TransactionEvent = new TestTransactionEvent().setFrom(NETHERMIND_DEPLOYER_ADDRESS).setTo(BOT_DEPLOYED_ADDRESS).addTraces({
  from: mockNethermindAddress,
  to: mockBotDeployedAddress
})

const expectedFinding = Finding.fromObject({
  name: "Bot Creation",
  description: `Bot created`,
  alertId: "BOT-2",
  severity: FindingSeverity.Low,
  type: FindingType.Info,
  metadata: {
    from: mockNethermindAddress,
    to: mockBotDeployedAddress
    
  },
});

const executeTransaction: Finding[] = await handleTransaction.handleTransaction(tx);

expect(executeTransaction).toEqual([expectedFinding]);
});

it('should find updated bot', async () => {
  const tx: TransactionEvent = new TestTransactionEvent()
    .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
    .setTo(BOT_DEPLOYED_ADDRESS)
    .addTraces({
      from: mockNethermindAddress,
      to: mockBotDeployedAddress
    });

  const expectedFinding = Finding.fromObject({
    name: "Bot Update",
    description: `Bot updated`,
    alertId: "BOT-3",
    severity: FindingSeverity.Low,
    type: FindingType.Info,
    metadata: {
      from: mockNethermindAddress,
      to: mockBotDeployedAddress
    },
  });

  const executeTransaction: Finding[] = await handleTransaction.handleTransaction(tx);

  expect(executeTransaction).toEqual([expectedFinding]);
});


});

// describe("high tether transfer agent", () => {
//   let handleTransaction: HandleTransaction;
//   const mockTxEvent = createTransactionEvent({} as any);

//   beforeAll(() => {
//     handleTransaction = agent.handleTransaction;
//   });

//   describe("handleTransaction", () => {
//     it("returns empty findings if there are no Tether transfers", async () => {
//       mockTxEvent.filterLog = jest.fn().mockReturnValue([]);

//       const findings = await handleTransaction(mockTxEvent);

//       expect(findings).toStrictEqual([]);
//       expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
//       expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
//         ERC20_TRANSFER_EVENT,
//         TETHER_ADDRESS,
//       );
//     });

//     it("returns a finding if there is a Tether transfer over 10,000", async () => {
//       const mockTetherTransferEvent = {
//         args: {
//           from: "0xabc",
//           to: "0xdef",
//           value: ethers.BigNumber.from("20000000000"), //20k with 6 decimals
//         },
//       };
//       mockTxEvent.filterLog = jest
//         .fn()
//         .mockReturnValue([mockTetherTransferEvent]);

//       const findings = await handleTransaction(mockTxEvent);

//       const normalizedValue = mockTetherTransferEvent.args.value.div(
//         10 ** TETHER_DECIMALS,
//       );
//       expect(findings).toStrictEqual([
//         Finding.fromObject({
//           name: "High Tether Transfer",
//           description: `High amount of USDT transferred: ${normalizedValue}`,
//           alertId: "FORTA-1",
//           severity: FindingSeverity.Low,
//           type: FindingType.Info,
//           metadata: {
//             to: mockTetherTransferEvent.args.to,
//             from: mockTetherTransferEvent.args.from,
//           },
//         }),
//       ]);
//       expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
//       expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
//         ERC20_TRANSFER_EVENT,
//         TETHER_ADDRESS,
//       );
//     });
//   });
// });
