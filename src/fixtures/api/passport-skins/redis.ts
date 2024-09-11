import { createClient } from 'redis'

export enum Index {
  PassportSkin = 'idx::clubs:passportskin',
}

export enum Prefix {
  PassportSkin = 'doc::clubs:passportskin',
}

export enum SchemaKey {
  PassportSkin = 'scm::clubs:passportskin',
}

export const generatePassportSkinKey = (payload: string) =>
  `${Prefix.PassportSkin}::${payload}`

export const defaultClient = () =>
  createClient({
    url: import.meta.env.REDIS_URL,
    username: import.meta.env.REDIS_USERNAME ?? '',
    password: import.meta.env.REDIS_PASSWORD ?? '',
    socket: {
      keepAlive: 1,
      reconnectStrategy: 1,
    },
  })

export const getDefaultClient = async () => {
  const redis = defaultClient()
  if (redis.isOpen === false) {
    await redis.connect()
  }
  return redis
}
