import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'
import { v5 as uuidv5 } from 'uuid'
import { toUtf8Bytes } from 'ethers'

dotenv.config()

const upgrade = (config) => {
  const decodedConfig = decode(config)

  const upgradedConfig = {
    ...decodedConfig,
    plugins: decodedConfig.plugins.map((plugin) => {
      /**
       * Find the posts plugin
       */
      if (plugin.name === 'devprotocol:clubs:plugin:posts') {
        /**
         * Find the feeds option and replace it with the new one
         */
        const options = plugin.options.map((option) => {
          if (option.name === 'feeds') {
            return {
              name: 'feeds',
              value: [
                {
                  id: decodedConfig.name,
                  slug: 'posts',
                  database: {
                    type: 'documents:redis',
                    key: uuidv5(
                      toUtf8Bytes(decodedConfig.name), // <!-- what should this be?
                      uuidv5(decodedConfig.url, uuidv5.URL),
                    ),
                  },
                },
              ],
            }
          }
          return option
        })

        return { ...plugin, options }
      }
      return plugin
    }),
  }

  return encode(upgradedConfig)
}

const main = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    /**
     * Loop through the redis keys
     */
    for await (const key of client.scanIterator()) {
      if (key.includes(':')) {
        // This is not a ClubsConfiguration
        console.log('Skipped:', key)
        continue
      }

      /**
       * Fetch the encoded config associated with the key
       */
      const encodedConfig = await client.get(key)

      /**
       * Upgrade the config
       */
      const upgradedConfig = upgrade(encodedConfig)

      /**
       * In the case the config is already up-to-date, continue to the next key
       */
      if (encodedConfig === upgradedConfig) {
        console.log('Up-to-date', key)
        continue
      }

      /**
       * Set the upgraded config
       */
      await client.set(key, upgradedConfig)
      console.log('Upgraded', key)
    }

    console.log('DB Upgraded')
    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.log(error)
  }
}

main()
