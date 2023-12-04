import { ZeroAddress, parseUnits, randomBytes, uuidV4 } from 'ethers'

/**
 * Define the base options. Please rewrite the common parameters as necessary.
 */
const base = {
  rpcUrl: 'https://polygon-bor.publicnode.com',
  chainId: 137,
  args: {
    to: '',
    property: '',
    payload: '0x0',
    gatewayAddress: '',
    amounts: {
      token: ZeroAddress,
      input: parseUnits('1', 18).toString(),
      fee: parseUnits('0.9', 18).toString(),
    },
  },
}

/**
 * Define the destination list.
 */
const dest = [ZeroAddress, ZeroAddress, ZeroAddress]

/**
 * Utility functions.
 */
const createId = () => {
  const id = uuidV4(randomBytes(8))
  return (key) => `${id}-${key}`
}
const id = createId()

/**
 * Export all the options.
 */
export default dest.map((to, i) => ({
  ...base,
  args: {
    ...base.args,
    to,
  },
  requestId: id(i),
}))
