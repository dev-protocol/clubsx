import { bytes32Hex } from '@devprotocol/clubs-core'

export const createPath = (payload: Uint8Array | string) =>
  `/fiat/yen/${bytes32Hex(payload)}`
