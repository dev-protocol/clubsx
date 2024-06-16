import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'
import { scanOnlyClubs } from './lib.scanOnlyClubs.mjs'

dotenv.config()

const upgrade = (key, config) => {
  const deocdedConfig = decode(config)
  const upgradedConfig = { ...deocdedConfig }

  if (upgradedConfig.rpcUrl?.includes('infura')) {
    upgradedConfig.rpcUrl = `https://${
      upgradedConfig.chainId === 1
        ? 'eth-mainnet.g.alchemy.com'
        : upgradedConfig.chainId === 137
          ? 'polygon-mainnet.g.alchemy.com'
          : upgradedConfig.chainId === 80002
            ? 'polygon-amoy.g.alchemy.com'
            : upgradedConfig.chainId === 42161
              ? 'arb-mainnet.g.alchemy.com'
              : 'eth-mainnet.g.alchemy.com'
    }/v2/${process.env.PUBLIC_ALCHEMY_KEY}`
  }

  return encode(upgradedConfig)
}

const app = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    for await (const key of scanOnlyClubs(client)) {
      if (key.includes(':')) {
        // This is not a ClubsConfiguration
        console.log('Skipped:', key)
        continue
      }

      const encodedConfig = await client.get(key)
      const upgradedConfig = upgrade(key, encodedConfig)
      if (encodedConfig === upgradedConfig) {
        console.log('Up-to-date', key)
        continue
      }

      console.log('Detect:', key)
      await client.set(key, upgradedConfig)
      console.log('Upgraded:', key)
    }

    console.log('DB Upgraded')
    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
