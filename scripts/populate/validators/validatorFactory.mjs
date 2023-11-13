import { encode } from '@devprotocol/clubs-core'

export const validatorFactory = (validator) => (config) => {
  const originalConfig = encode(config)
  const result = validator(config)
  const encodedConfig = encode(config)

  if (originalConfig === encodedConfig && result === true) {
    return encodedConfig
  }

  if (result !== true && !(result instanceof Error)) {
    throw new Error('Validator result must be true or Error')
  }

  if (originalConfig !== encodedConfig) {
    throw new Error('Validator is not allowed to change config')
  }

  throw new Error(result.message)
}
