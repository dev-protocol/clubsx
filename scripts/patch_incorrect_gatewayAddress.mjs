import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'

dotenv.config()

const TARGETS = [
  {
    p: '0xf6C0794ac7bF5c7d546e03254e7A4E1DCE8526c1',
    g: '0x8Cdd33D7C33fDE255Fd044cBEE4D09aab494Ce0e',
  },
  {
    p: '0xcAB63Dc00590f5447530760f213dEc046f2c566e',
    g: '0xE6d7194F927a01c1682D5f10aEF0E7162c0C5834',
  },
  {
    p: '0x033524b9fB308510f4A27C01385bb5Ce90c226aA',
    g: '0xC3bE5a7B26be6379222c39d137232e89B9c9e8Ab',
  },
]

const upgrade = (key, config) => {
  const deocdedConfig = decode(config)
  const upgradedConfig = { ...deocdedConfig }

  const T = TARGETS.find((t) => t.p === upgradedConfig.propertyAddress)
  if (T) {
    console.log(key, 'IS HIT')
    console.log(key, `'s old value is:`, config)

    upgradedConfig.plugins = upgradedConfig.plugins.map((plugin) => {
      return plugin.name === 'memberships'
        ? {
            ...plugin,
            options: plugin.options.map((pluginOptions) =>
              pluginOptions.key === 'memberships'
                ? {
                    ...pluginOptions,
                    value: pluginOptions.value.map((pluginOptionValue) => ({
                      ...pluginOptionValue,
                      fee: {
                        percentage: 0,
                        beneficiary: T.g,
                      },
                    })),
                  }
                : pluginOptions
            ),
          }
        : plugin
    })
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

    for await (const key of client.scanIterator()) {
      if (key.startsWith('id::')) {
        // This is not a ClubsConfiguration
        console.log('Skipped:', key)
        continue
      }

      const encodedConfig = await client.get(key)
      const upgradedConfig = upgrade(key, encodedConfig)
      if (encodedConfig === upgradedConfig) {
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
