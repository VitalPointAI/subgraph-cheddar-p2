import { near, log, BigInt, json, JSONValueKind } from "@graphprotocol/graph-ts";
import { WithdrawCrop, FTMint, Transfer } from "../generated/schema";

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  const actions = receipt.receipt.actions;
  
  for (let i = 0; i < actions.length; i++) {
    handleAction(
      actions[i], 
      receipt.receipt, 
      receipt.block.header,
      receipt.outcome,
      receipt.receipt.signerPublicKey
      );
  }
}

function handleAction(
  action: near.ActionValue,
  receipt: near.ActionReceipt,
  blockHeader: near.BlockHeader,
  outcome: near.ExecutionOutcome,
  publicKey: near.PublicKey
): void {
  
  if (action.kind != near.ActionKind.FUNCTION_CALL) {
    log.info("Early return: {}", ["Not a function call"]);
    return;
  }
  
  const functionCall = action.toFunctionCall();

  // change the methodName here to the methodName emitting the log in the contract
  if (functionCall.methodName == "withdraw_crop") {
    const receiptId = receipt.id.toBase58();

      // Maps the formatted log to the LOG entity
      let crop = new WithdrawCrop(`${receiptId}`);

      // Standard receipt properties
      crop.blockTime = BigInt.fromU64(blockHeader.timestampNanosec/1000000)
      crop.blockHeight = BigInt.fromU64(blockHeader.height)
      crop.blockHash = blockHeader.hash.toBase58()
      crop.predecessorId = receipt.predecessorId
      crop.receiverId = receipt.receiverId
      crop.signerId = receipt.signerId
      crop.signerPublicKey = publicKey.bytes.toBase58()
      crop.gasBurned = BigInt.fromU64(outcome.gasBurnt)
      crop.tokensBurned = outcome.tokensBurnt
      crop.outcomeId = outcome.id.toBase58()
      crop.executorId = outcome.executorId
      crop.outcomeBlockHash = outcome.blockHash.toBase58()

      // Log parsing
      if(outcome.logs != null && outcome.logs.length > 0){
        crop.log = outcome.logs[0]
      }

      crop.save()
      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  // change the methodName here to the methodName emitting the log in the contract
  if (functionCall.methodName == "ft_mint") {
    const receiptId = receipt.id.toBase58();

      // Maps the JSON formatted log to the LOG entity
      let logs = new FTMint(`${receiptId}`);

       // Standard receipt properties
       logs.blockTime = BigInt.fromU64(blockHeader.timestampNanosec/1000000)
       logs.blockHeight = BigInt.fromU64(blockHeader.height)
       logs.blockHash = blockHeader.hash.toBase58()
       logs.predecessorId = receipt.predecessorId
       logs.receiverId = receipt.receiverId
       logs.signerId = receipt.signerId
       logs.signerPublicKey = publicKey.bytes.toBase58()
       logs.gasBurned = BigInt.fromU64(outcome.gasBurnt)
       logs.tokensBurned = outcome.tokensBurnt
       logs.outcomeId = outcome.id.toBase58()
       logs.executorId = outcome.executorId
       logs.outcomeBlockHash = outcome.blockHash.toBase58()

      // Log parsing
      if(outcome.logs != null && outcome.logs.length > 0){
        logs.log = outcome.logs[0]
        let splitString = outcome.logs[0].split(' ')
        logs.action = splitString[0].toString()
        logs.amount = BigInt.fromString(splitString[1])
        logs.token = splitString[2].toString()
        logs.to = splitString[4].toString().slice(0, -1)
        let splitMemo = outcome.logs[0].split(':')
        if(splitMemo[1]){
          logs.memo = splitMemo[1].slice(1,)
          } else {
            logs.memo = null
          }
      }
      logs.save()
      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

   // change the methodName here to the methodName emitting the log in the contract
   if (functionCall.methodName == "ft_transfer_call") {
    const receiptId = receipt.id.toBase58();

      // Maps the JSON formatted log to the LOG entity
      let transfers = new Transfer(`${receiptId}`);

      // Standard receipt properties
      transfers.blockTime = BigInt.fromU64(blockHeader.timestampNanosec/1000000)
      transfers.blockHeight = BigInt.fromU64(blockHeader.height)
      transfers.blockHash = blockHeader.hash.toBase58()
      transfers.predecessorId = receipt.predecessorId
      transfers.receiverId = receipt.receiverId
      transfers.signerId = receipt.signerId
      transfers.signerPublicKey = publicKey.bytes.toBase58()
      transfers.gasBurned = BigInt.fromU64(outcome.gasBurnt)
      transfers.tokensBurned = outcome.tokensBurnt
      transfers.outcomeId = outcome.id.toBase58()
      transfers.executorId = outcome.executorId
      transfers.outcomeBlockHash = outcome.blockHash.toBase58()

      // Log parsing
      if(outcome.logs != null && outcome.logs.length > 0){
        transfers.log = outcome.logs[0]
        let splitString = outcome.logs[0].split(' ')
        transfers.action = splitString[0].toString()
        transfers.amount = BigInt.fromString(splitString[1])
        transfers.transferFrom = splitString[3].toString()
        transfers.transferTo = splitString[5]
        let splitMemo = outcome.logs[0].split(':')
        if(splitMemo[1]){
        transfers.memo = splitMemo[1].slice(1,)
        } else {
          transfers.memo = null
        }
      }

      transfers.save()

  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

}
