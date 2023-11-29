import { expect, it } from 'vitest'
import { validator } from './tanadao.mjs'
import { override } from '../constants/tanadao.mjs'

it('validator returns true when the config has correct values', () => {
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

  expect(res).toBe(true)
})

it('validator returns error when the config has not correct values', () => {
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

  expect(res).toEqual(
    new Error('Clubs Payments options does not have the expected options.'),
  )
})

it.skip(
  'encodeIfValid is a function that returned by validatorFactory encapsulate validator',
)
