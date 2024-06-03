import { generateProfileId } from '@fixtures/api/keys'
import { headers, cache } from '@fixtures/api/headers'
import { createClient } from 'redis'

const truncateEthAddress = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
  )
  if (!match) return address
  return `${match[1]}\u2026${match[2]}`
}

const AVATAR_URL = 'https://source.boringavatars.com/beam/'

let cachedSvgDataURL = ''
const getBoringAvatar = async (address: string) => {
  if (cachedSvgDataURL) {
    return cachedSvgDataURL
  }

  try {
    const response = await fetch(`${AVATAR_URL}${address}`)
    const body = await response.text()
    const dataUrl =
      'data:image/svg+xml;base64,' + Buffer.from(body).toString('base64')
    cachedSvgDataURL = dataUrl
    return dataUrl
  } catch (err) {
    console.error(err)
    return ''
  }
}

export const GET = async ({
  params: { id },
}: {
  params: { id: string | undefined }
}) => {
  if (!id) {
    return new Response(JSON.stringify({ error: 'No profile ID passed' }), {
      status: 401,
    })
  }

  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
    socket: {
      keepAlive: 1,
      reconnectStrategy: 1,
    },
  })
  await client.connect()

  const profileId = generateProfileId(id)

  const userProfile = (await client.get(profileId)) ?? undefined
  await client.quit()

  if (!userProfile) {
    return new Response(
      JSON.stringify({
        username: truncateEthAddress(id),
        avatar: await getBoringAvatar(id),
      }),
      {
        status: 200,
        headers: { ...headers, ...cache({ maxAge: 30 }) },
      },
    )
  }

  return new Response(userProfile, {
    status: 200,
    headers: { ...headers, ...cache({ maxAge: 30 }) },
  })
}
