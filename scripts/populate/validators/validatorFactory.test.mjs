import { expect, it } from 'vitest'
import { validatorFactory } from './validatorFactory.mjs'
import { encode } from '@devprotocol/clubs-core'

it('validatorFactory returns a curryed function that takes config and returns encoded config', () => {
  const validator = validatorFactory((config) => {
    expect(config.name).toBe('test')
    return true
  })

  expect(validator({ name: 'test' })).toEqual(encode({ name: 'test' }))
})

it('created function throws an Error when the handler returns a value other than true', () => {
  const validator = validatorFactory(() => {
    return false
  })
  expect(() => validator({ name: 'test' })).toThrowError(
    'Validator result must be true or Error',
  )
})

it('created function throws an Error when the handler returns a value other than Error', () => {
  const validator = validatorFactory(() => {
    return undefined
  })
  expect(() => validator({ name: 'test' })).toThrowError(
    'Validator result must be true or Error',
  )
})

it('created function bypasses/throws an Error if the handler returns Error', () => {
  const validator = validatorFactory(() => {
    return new Error('TEST')
  })

  expect(() => validator({ name: 'test' })).toThrowError('TEST')
})

it('created function throws an Error when the config will be changed in validation flow', () => {
  const validator = validatorFactory((config) => {
    config.name = 'changed'
    return true
  })

  expect(() => validator({ name: 'test' })).toThrowError(
    'Validator is not allowed to change config',
  )
})
