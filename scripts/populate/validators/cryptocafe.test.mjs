import test from 'ava'
import { validator } from './cryptocafe.mjs'
import jsonwebtoken from 'jsonwebtoken'

test('validator returns true when the config has correct values', (t) => {
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

  t.is(res, true)
})

test('validator returns error when the config has not webhook URL for each tickets', (t) => {
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

  t.deepEqual(res, new Error('Tickets must be having webhook URL'))
})

test('validator returns error when the config has incorrect webhook URL for each tickets', (t) => {
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

  t.deepEqual(res, new Error('Tickets must be having webhook URL'))
})

test('validator returns error when CRYPTOCAFE_TICKET_WEBHOOK_KEY is not set', (t) => {
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

  t.deepEqual(
    res,
    new Error('CRYPTOCAFE_TICKET_WEBHOOK_KEY and SALT must be set'),
  )
})

test('validator returns error when SALT is not set', (t) => {
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

  t.deepEqual(
    res,
    new Error('CRYPTOCAFE_TICKET_WEBHOOK_KEY and SALT must be set'),
  )
})

test('validator returns error when CRYPTOCAFE_TICKET_WEBHOOK_KEY is empty', (t) => {
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

  t.deepEqual(
    res,
    new Error('CRYPTOCAFE_TICKET_WEBHOOK_KEY and SALT must be set'),
  )
})

test('validator returns error when SALT is empty', (t) => {
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

  t.deepEqual(
    res,
    new Error('CRYPTOCAFE_TICKET_WEBHOOK_KEY and SALT must be set'),
  )
})

test.todo(
  'encodeIfValid is a function that returned by validatorFactory encapsulate validator',
)
