const truncateEthAddress = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
  )
  if (!match) return address
  return `${match[1]}\u2026${match[2]}`
}

const AVATAR_URL = 'https://source.boringavatars.com/beam/'

const cachedSvgDataURL = new Map<string, string>()
const getBoringAvatar = async (address: string) => {
  const fromCache = cachedSvgDataURL.get(address)
  if (fromCache) {
    return fromCache
  }

  try {
    const response = await fetch(`${AVATAR_URL}${address}`)
    const body = await response.text()
    const dataUrl =
      'data:image/svg+xml;base64,' + Buffer.from(body).toString('base64')
    return cachedSvgDataURL.set(address, dataUrl).get(address) as string
  } catch (err) {
    console.error(err)
    return ''
  }
}

export const getDefaultProfile = async ({ id }: { id: string }) => {
  return {
    username: truncateEthAddress(id),
    avatar: await getBoringAvatar(id),
  }
}
