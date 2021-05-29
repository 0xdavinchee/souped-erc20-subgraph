import { BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Approval, Transfer } from "../generated/Souped/Souped";
import { ApprovalEvent, Token, TransferEvent } from "../generated/schema";
import { ONE, toDecimal } from "./helper";
const GENESIS_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleApproval(event: Approval): void {
  let token = Token.load(event.address.toHex());

  if (token == null) {
    return;
  }
  let approvalEvent = new ApprovalEvent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  let amount = toDecimal(event.params.value, token.decimals);
  approvalEvent.token = event.address.toHex();
  approvalEvent.sender = event.transaction.from;
  approvalEvent.amount = amount;
  approvalEvent.spender = event.transaction.to!;

  approvalEvent.block = event.block.number;
  approvalEvent.timestamp = event.block.timestamp;
  approvalEvent.transaction = event.transaction.hash;
  
  approvalEvent.save();

  token.eventCount.plus(ONE);
  token.save();
}

export function handleTransfer(event: Transfer): void {
  let token = Token.load(event.address.toHex());

  if (token == null) {
    return;
  }
  let amount = toDecimal(event.params.value, token.decimals);

  let isBurn = event.params.to.toHex() == GENESIS_ADDRESS;

  let entityEventId: string;

  if (isBurn) {
    let entityEvent = handleBurnEvent(token, amount, event.params.to, event);
    entityEventId = entityEvent.id;
  }

  if (!isBurn) {
    let entityEvent = handleTransferEvent(
      token,
      amount,
      event.params.from,
      event.params.to,
      event
    );
    entityEventId = entityEvent.id;
  }
}

function handleBurnEvent(
  token: Token | null,
  amount: BigDecimal,
  destination: Bytes,
  event: ethereum.Event
): TransferEvent {
  let burnEvent = new TransferEvent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  burnEvent.token = event.address.toHex();
  burnEvent.sender = event.transaction.from;
  burnEvent.amount = amount;
  burnEvent.recipient = destination;

  burnEvent.block = event.block.number;
  burnEvent.timestamp = event.block.timestamp;
  burnEvent.transaction = event.transaction.hash;

  burnEvent.save();

  // Track total supply/burned
  if (token != null) {
    token.burnEventCount = token.burnEventCount.plus(ONE);
    token.eventCount = token.eventCount.plus(ONE);
    token.totalSupply = token.totalSupply.minus(amount);
    token.totalBurned = token.totalBurned.plus(amount);

    token.save();
  }

  return burnEvent;
}

// maybe we can just pass in event here and get destination and
// sender from event (event.transaction.to/from)
function handleTransferEvent(
  token: Token | null,
  amount: BigDecimal,
  sender: Bytes,
  destination: Bytes,
  event: ethereum.Event
): TransferEvent {
  let transferEvent = new TransferEvent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  transferEvent.token = event.address.toHex();
  transferEvent.sender = sender;
  transferEvent.amount = amount;
  transferEvent.recipient = destination;

  transferEvent.block = event.block.number;
  transferEvent.timestamp = event.block.timestamp;
  transferEvent.transaction = event.transaction.hash;

  transferEvent.save();

  if (token != null) {
    token.eventCount = token.eventCount.plus(ONE);
    token.transferEventCount = token.transferEventCount.plus(ONE);
    token.totalTransferred = token.totalTransferred.plus(amount);

    token.save();
  }

  return transferEvent;
}
