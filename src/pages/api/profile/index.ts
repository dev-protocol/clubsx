import { generateProfileId } from '@fixtures/api/keys'
import { hashMessage, recoverAddress } from 'ethers'
import { createClient } from 'redis'

type Payload = string

export type Clip = {
  sTokenId: string
  payload: Payload
  description: string
  frameColorHex: string
  createdAt: number
  updatedAt: number
}

export type Skin = {
  id: string // Nano id
  name?: string // identifier for passport config
  theme?: Payload // Pointing to PassportItem.sTokenPayload
  clips?: Clip[] // Token payloads of pinned clips
  videos?: Clip[] // for the future use cases
  bgm?: Clip // for the future use cases
  likes?: number
  spotlight?: Clip[]
  isHidden?: boolean
}

export type Profile = {
  skins?: Skin[] // the default skin is always the first item
  avatar?: string
  username?: string
  description?: string
  sns?: {
    [platform: string]: string
  }
  likes?: number
}

export const POST = async ({ request }: { request: Request }) => {
  const { profile, sig, hash } = (await request.json()) as {
    profile?: Profile
    hash: string
    sig: string
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

  client.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  const digest = hashMessage(hash)
  const address = recoverAddress(digest, sig)
  const profileId = generateProfileId(address)

  const userProfile = JSON.parse(
    (await client.get(profileId)) ?? '{}',
  ) as Profile

  const nextProfile: Profile = {
    ...userProfile,
    ...profile,
  }

  try {
    await client.set(profileId, JSON.stringify(nextProfile))
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    await client.quit()
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
