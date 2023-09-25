import { arrayify } from '@devprotocol/dev-kit'
import { keccak256 } from 'ethers'

export const bytes32Hex = (
  payload: string | Uint8Array | { [key: number]: number },
) =>
  typeof payload === 'string'
    ? payload
    : payload instanceof Uint8Array
    ? keccak256(payload)
    : keccak256(new Uint8Array(arrayify(payload)))
