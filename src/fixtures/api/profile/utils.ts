import ReactDOM from 'react-dom/server'
import { createElement } from 'react'
import Avatar from './avatar'

const truncateEthAddress = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
  )
  if (!match) return address
  return `${match[1]}\u2026${match[2]}`
}

const cachedSvgDataURL = new Map<string, string>()
const getBoringAvatar = async (address: string) => {
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
    username: truncateEthAddress(id),
    avatar: await getBoringAvatar(id),
  }
}
