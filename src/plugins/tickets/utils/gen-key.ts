import { bytes32Hex } from '@devprotocol/clubs-core'
import { meta } from '..'
import { isAddress } from 'ethers'

export const genHistoryKey = (
  propertyAddress: string,
  payloadOrContract: string | Uint8Array,
  tokenId: string | number,
) =>
  `${meta.id}:history:${propertyAddress}:${isAddress(payloadOrContract) ? `addr:${payloadOrContract}` : bytes32Hex(payloadOrContract)}#${tokenId}`
