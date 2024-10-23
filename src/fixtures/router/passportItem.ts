import {
  whenNotError,
  whenNotErrorAll,
  type ErrorOr,
} from '@devprotocol/util-ts'
import type { Skin } from '@pages/api/profile'

export const itemTypeToKey = (type: keyof Skin) => {
  const t =
    (type as string) === 'spotlight'
      ? 't1'
      : type === 'clips'
        ? 't2'
        : type === 'videos'
          ? 't3'
          : new Error('Unexpected type is passed')
  return t
}

export const itemKeyToType = (type: string) => {
  const t =
    type === 't1'
      ? 'spotlight'
      : type === 't2'
        ? 'clips'
        : type === 't3'
          ? 'videos'
          : new Error('Unexpected type is passed')
  return t
}

export const itemToHash = (
  type: keyof Skin,
  index: number,
): ErrorOr<string> => {
  const t = itemTypeToKey(type)
  return whenNotError(t, (_t) => `${_t}:${index}`)
}

export const hashToItem = (value: string) => {
  const [typeStr, indexStr] = value.split(':')
  const type = itemKeyToType(typeStr)
  const index = ((num) =>
    isNaN(num) ? new Error('Unexpected index is passed') : num)(
    Number(indexStr.replace(/^i([0-9]+).*/, '$1')),
  )

  return whenNotErrorAll([type, index], ([_type, _index]) => ({
    type: _type as 'clips' | 'videos',
    index: _index,
  }))
}
