import { expect, it } from 'vitest'
import { validator } from './cryptocafe.mjs'
import jsonwebtoken from 'jsonwebtoken'

it('validator returns true when the config has correct values', () => {
  process.env.CRYPTOCAFE_TICKET_WEBHOOK_KEY = 'X'
  process.env.SALT = 'X'

  const expectedWebhookUrl = jsonwebtoken.sign(
    `https://clubs-userland-cryptocafe.vercel.app/api/webhooks/tickets/X/dest/airtable/tblPinFQ8dUbrhzPn`,
    'X',
  )

  const res = validator({
    plugins: [
      {
        id: 'devprotocol:clubs:plugin:tickets',
        options: [
          {
            key: 'tickets',
            value: [{ webhooks: { used: { encrypted: expectedWebhookUrl } } }],
          },
        ],
      },
    ],
  })

  expect(res).toBe(true)
})

it('validator returns error when the config has not webhook URL for each tickets', () => {
  process.env.CRYPTOCAFE_TICKET_WEBHOOK_KEY = 'X'
  process.env.SALT = 'X'

  const res = validator({
    plugins: [
      {
        id: 'devprotocol:clubs:plugin:tickets',
        options: [
          {
            key: 'tickets',
            value: [{ webhooks: { used: { encrypted: undefined } } }],
          },
        ],
      },
    ],
  })

  expect(res).toEqual(new Error('Tickets must be having webhook URL'))
})

it('validator returns error when the config has incorrect webhook URL for each tickets', () => {
  process.env.CRYPTOCAFE_TICKET_WEBHOOK_KEY = 'X'
  process.env.SALT = 'X'

  const res = validator({
    plugins: [
      {
        id: 'devprotocol:clubs:plugin:tickets',
        options: [
          {
            key: 'tickets',
            value: [
              { webhooks: { used: { encrypted: 'http://example.com' } } },
            ],
          },
        ],
      },
    ],
  })

  expect(res).toEqual(new Error('Tickets must be having webhook URL'))
})

it('validator returns error when CRYPTOCAFE_TICKET_WEBHOOK_KEY is not set', () => {
  delete process.env.CRYPTOCAFE_TICKET_WEBHOOK_KEY
  process.env.SALT = 'X'

  const res = validator({
    plugins: [
      {
        id: 'devprotocol:clubs:plugin:tickets',
        options: [
          {
            key: 'tickets',
            value: [
              {
                webhooks: {
                  used: {
                    encrypted: jsonwebtoken.sign(
                      `https://clubs-userland-cryptocafe.vercel.app/api/webhooks/tickets/undefined/dest/airtable/tblPinFQ8dUbrhzPn`,
                      'X',
                    ),
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  })

  expect(res).toEqual(
    new Error('CRYPTOCAFE_TICKET_WEBHOOK_KEY and SALT must be set'),
  )
})

it('validator returns error when SALT is not set', () => {
  process.env.CRYPTOCAFE_TICKET_WEBHOOK_KEY = 'X'
  delete process.env.SALT

  const res = validator({
    plugins: [
      {
        id: 'devprotocol:clubs:plugin:tickets',
        options: [
          {
            key: 'tickets',
            value: [
              {
                webhooks: {
                  used: {
                    encrypted: jsonwebtoken.sign(
                      `https://clubs-userland-cryptocafe.vercel.app/api/webhooks/tickets/undefined/dest/airtable/tblPinFQ8dUbrhzPn`,
                      '.',
                    ),
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  })

  expect(res).toEqual(
    new Error('CRYPTOCAFE_TICKET_WEBHOOK_KEY and SALT must be set'),
  )
})

it('validator returns error when CRYPTOCAFE_TICKET_WEBHOOK_KEY is empty', () => {
  process.env.CRYPTOCAFE_TICKET_WEBHOOK_KEY = ''
  process.env.SALT = 'X'

  const res = validator({
    plugins: [
      {
        id: 'devprotocol:clubs:plugin:tickets',
        options: [
          {
            key: 'tickets',
            value: [
              {
                webhooks: {
                  used: {
                    encrypted: jsonwebtoken.sign(
                      `https://clubs-userland-cryptocafe.vercel.app/api/webhooks/tickets//dest/airtable/tblPinFQ8dUbrhzPn`,
                      'X',
                    ),
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  })

  expect(res).toEqual(
    new Error('CRYPTOCAFE_TICKET_WEBHOOK_KEY and SALT must be set'),
  )
})

it('validator returns error when SALT is empty', () => {
  process.env.CRYPTOCAFE_TICKET_WEBHOOK_KEY = 'X'
  process.env.SALT = ''

  const res = validator({
    plugins: [
      {
        id: 'devprotocol:clubs:plugin:tickets',
        options: [
          {
            key: 'tickets',
            value: [
              {
                webhooks: {
                  used: {
                    encrypted: jsonwebtoken.sign(
                      `https://clubs-userland-cryptocafe.vercel.app/api/webhooks/tickets/X/dest/airtable/tblPinFQ8dUbrhzPn`,
                      '.',
                    ),
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  })

  expect(res).toEqual(
    new Error('CRYPTOCAFE_TICKET_WEBHOOK_KEY and SALT must be set'),
  )
})

it.skip(
  'encodeIfValid is a function that returned by validatorFactory encapsulate validator',
)
