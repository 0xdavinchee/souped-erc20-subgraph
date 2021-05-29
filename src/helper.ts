import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
export function toDecimal(value: BigInt, decimals: u32): BigDecimal {
  let precision = BigInt.fromI32(10)
    .pow(<u8>decimals)
    .toBigDecimal();

  return value.divDecimal(precision);
}

export let ONE = BigInt.fromI32(1);