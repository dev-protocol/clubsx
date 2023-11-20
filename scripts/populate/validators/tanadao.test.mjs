import test from 'ava'
import { validator } from './tanadao.mjs'
import { override } from '../constants/tanadao.mjs'

test('validator returns true when the config has correct values', (t) => {
  const expectedOptions = [
    {
      key: 'override',
      value: override,
    },
  ]

  const res = validator({
    plugins: [
      {
        id: 'devprotocol:clubs:plugin:clubs-payments',
        options: expectedOptions,
      },
    ],
  })

  t.is(res, true)
})

test('validator returns error when the config has not correct values', (t) => {
  const res = validator({
    plugins: [
      {
        id: 'devprotocol:clubs:plugin:clubs-payments',
        options: [
          {
            key: 'override',
            value: [...override, override[0]],
          },
        ],
      },
    ],
  })

  t.deepEqual(
    res,
    new Error('Clubs Payments options does not have the expected options.'),
  )
})

test.todo(
  'encodeIfValid is a function that returned by validatorFactory encapsulate validator',
)
