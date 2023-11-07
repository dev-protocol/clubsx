import { keccak256, toUtf8Bytes } from 'ethers'

export const toBytes32 = (str) => keccak256(toUtf8Bytes(str))
