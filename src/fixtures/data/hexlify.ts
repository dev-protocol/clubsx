import { keccak256 } from 'ethers'

export const bytes32Hex = (payload: string | Uint8Array) =>
  typeof payload === 'string' ? payload : keccak256(payload)
