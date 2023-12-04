import { ZeroAddress, randomBytes, uuidV4 } from 'ethers'

/**
 * Define the base options. Please rewrite the common parameters as necessary.
 */
const base = {
  rpcUrl: 'https://polygon-bor.publicnode.com',
  chainId: 137,
  args: {
    to: ZeroAddress,
    property: ZeroAddress,
    payload: '0x0',
    gatewayAddress: ZeroAddress,
    amounts: {
      token: ZeroAddress,
      input: 0n,
      fee: 0n,
    },
  },
}

const createId = () => {
  const id = uuidV4(randomBytes(8))
  return (key) => `${id}-${key}`
}
const id = createId()

/**
 * Export all the options.
 */
export default [
  { ...base, to: ZeroAddress, requestId: id(1) },
  { ...base, to: ZeroAddress, requestId: id(2) },
  { ...base, to: ZeroAddress, requestId: id(3) },
]
