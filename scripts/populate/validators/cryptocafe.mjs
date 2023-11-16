import { validatorFactory } from './validatorFactory.mjs'
import jsonwebtoken from 'jsonwebtoken'

export const validator = (config) => {
  const { CRYPTOCAFE_TICKET_WEBHOOK_KEY, SALT } = process.env

  /**
   * Tickets must be having webhook URL
   */
  const testForTicketsWebhook = (() => {
    const ticketsConfig = config.plugins.find(
      ({ id }) => id === 'devprotocol:clubs:plugin:tickets',
    )

    const expectedWebhookUrl = jsonwebtoken.sign(
      `https://clubs-userland-cryptocafe.vercel.app/api/webhooks/tickets/${CRYPTOCAFE_TICKET_WEBHOOK_KEY}/dest/airtable/tblPinFQ8dUbrhzPn`,
      SALT || '.',
    )
    const ticketsOption = ticketsConfig.options.find(
      ({ key }) => key === 'tickets',
    ).value
    const isRequiredEnvsAreSet =
      typeof CRYPTOCAFE_TICKET_WEBHOOK_KEY === 'string' &&
      typeof SALT === 'string' &&
      CRYPTOCAFE_TICKET_WEBHOOK_KEY !== '' &&
      SALT !== ''
    const allTicketsHaveWebhook = ticketsOption.every(
      (opts) => opts.webhooks.used.encrypted === expectedWebhookUrl,
    )

    return isRequiredEnvsAreSet && allTicketsHaveWebhook
      ? true
      : isRequiredEnvsAreSet
      ? new Error('Tickets must be having webhook URL')
      : new Error('CRYPTOCAFE_TICKET_WEBHOOK_KEY and SALT must be set')
  })()

  return testForTicketsWebhook
}

export const encodeIfValid = validatorFactory(validator)
