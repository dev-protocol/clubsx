import { encode } from '@devprotocol/clubs-core'
import { override } from '../constants/tanadao.mjs'
import { validatorFactory } from './validatorFactory.mjs'

export const validator = (config) => {
  const testForClubsPayments = (() => {
    const plugin = config.plugins.find(
      ({ id }) => id === 'devprotocol:clubs:plugin:clubs-payments',
    )

    const expectedOptions = [
      {
        key: 'override',
        value: override,
      },
    ]

    const pluginHasExpectedOptions =
      encode(plugin.options) === encode(expectedOptions)
    return pluginHasExpectedOptions
      ? true
      : new Error('Clubs Payments options does not have the expected options.')
  })()

  return testForClubsPayments
}

export const encodeIfValid = validatorFactory(validator)
