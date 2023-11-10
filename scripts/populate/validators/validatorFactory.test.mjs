import test from 'ava'
import { validatorFactory } from './validatorFactory.mjs'
import { encode } from '@devprotocol/clubs-core'

test('validatorFactory returns a curryed function that takes config and returns encoded config', (t) => {
  const validator = validatorFactory((config) => {
    t.is(config.name, 'test')
    return true
  })

  t.is(validator({ name: 'test' }), encode({ name: 'test' }))
})

test('created function throws an Error when the handler returns a value other than true', (t) => {
  const validator = validatorFactory(() => {
    return false
  })
  const res = t.throws(() => validator({ name: 'test' }))

  t.is(res.message, 'Validator result must be true or Error')
})

test('created function throws an Error when the handler returns a value other than Error', (t) => {
  const validator = validatorFactory(() => {
    return undefined
  })
  const res = t.throws(() => validator({ name: 'test' }))

  t.is(res.message, 'Validator result must be true or Error')
})

test('created function bypasses/throws an Error if the handler returns Error', (t) => {
  const validator = validatorFactory(() => {
    return new Error('TEST')
  })

  const res = t.throws(() => validator({ name: 'test' }))

  t.is(res.message, 'TEST')
})

test('created function throws an Error when the config will be changed in validation flow', (t) => {
  const validator = validatorFactory((config) => {
    config.name = 'changed'
    return true
  })

  const res = t.throws(() => validator({ name: 'test' }))

  t.is(res.message, 'Validator is not allowed to change config')
})
