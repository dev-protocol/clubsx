import { bytes32Hex } from '@devprotocol/clubs-core'
import { meta } from '..'

export const genHistoryKey = (
  propertyAddress: string,
  payload: string | Uint8Array,
  sTokensId: string | number,
) => `${meta.id}:history:${propertyAddress}:${bytes32Hex(payload)}#${sTokensId}`
