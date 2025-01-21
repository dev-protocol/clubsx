import {
  whenNotError,
  whenNotErrorAll,
  type ErrorOr,
} from '@devprotocol/util-ts'
import type { Skin } from '@pages/api/profile'
import { tryCatch } from 'ramda'

export type ClipTypes = Exclude<
  keyof Skin,
  'id' | 'name' | 'theme' | 'likes' | 'isHidden'
>

export const itemTypeToKey = (type: ClipTypes) => {
  const t =
    type === 'spotlight'
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
  type: ClipTypes,
  sTokenId: number | string,
): ErrorOr<string> => {
  const t = itemTypeToKey(type)
  return whenNotError(t, (_t) => `${_t}-i${sTokenId}`)
}

export const hashToItem = (value: string) => {
  const [typeStr, indexStr] = value.split('-')
  const type = itemKeyToType(typeStr)
  const id = tryCatch(
    (v: string) => v,
    () => new Error('Unexpected index is passed'),
  )(indexStr.replace(/^i(.*)/, '$1'))

  return whenNotErrorAll([type, id], ([_type, _id]) => ({
    type: _type as ClipTypes,
    id: _id,
  }))
}
