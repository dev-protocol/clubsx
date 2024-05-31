import { createClient } from 'redis'

export enum Index {
  Asset = 'idx::clubs:asset',
  Log = 'idx::clubs:asset:run',
}

export enum Prefix {
  Asset = 'doc::clubs:asset::',
  Log = 'doc::clubs:asset:run::',
}

export enum SchemaKey {
  Asset = 'scm::clubs:asset',
  Log = 'scm::clubs:asset:run',
}

export const generateAssetKey = (contract: string, id?: string | number) =>
  `${Prefix.Asset}::${contract}:${id ?? ''}`

export const generateLogKey = (contract: string) => `${Prefix.Log}${contract}`

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
