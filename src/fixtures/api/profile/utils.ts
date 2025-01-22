import ReactDOM from 'react-dom/server'
import { createElement } from 'react'
import Avatar from './avatar'
import {
  uniqueNamesGenerator,
  starWars,
  colors,
  names,
  animals,
} from 'unique-names-generator'
import type { Config } from 'unique-names-generator'

export const config: Config = {
  dictionaries: [colors, animals, starWars, names],
  separator: ' ',
  length: 2,
  style: 'capital',
  seed: '',
}

const cachedSvgDataURL = new Map<string, string>()
export const getBoringAvatar = async (address: string) => {
  const fromCache = cachedSvgDataURL.get(address)
  if (fromCache) {
    return fromCache
  }

  const body = ReactDOM.renderToString(createElement(Avatar, { id: address }))

  const dataUrl =
    'data:image/svg+xml;base64,' + Buffer.from(body).toString('base64')
  return cachedSvgDataURL.set(address, dataUrl).get(address) as string
}

export const getDefaultProfile = async ({ id }: { id: string }) => {
  return {
    username: uniqueNamesGenerator({ ...config, seed: id }),
    avatar: await getBoringAvatar(id),
  }
}
