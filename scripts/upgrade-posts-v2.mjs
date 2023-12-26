import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'
import { v5 as uuidv5 } from 'uuid'
import { toUtf8Bytes } from 'ethers'

dotenv.config()

const upgradeConfig = (decodedConfig, feeds) => {
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
              value: feeds,
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
      const decodedConfig = decode(encodedConfig)

      /**
       * Find the posts plugin
       */
      const pluginPost = decodedConfig.plugins.find(
        (plugin) => plugin.name === 'devprotocol:clubs:plugin:posts',
      )

      /** Club doesn't have Posts installed, continue */
      if (!pluginPost) {
        console.log('Skipped: no post plugin', key)
        continue
      }

      /**
       * Find the feeds option
       **/
      const feeds = pluginPost.options.find((option) => option.name === 'feeds')

      /** Club doesn't have Posts installed, continue */
      if (!feeds) {
        console.log('Skipped: no feeds found', key)
        continue
      }

      /**
       * We add the new feed value for copying the posts content
       */
      const appendedFeeds = [
        ...feeds.value,
        {
          id: 'default-2',
          slug: 'posts',
          database: {
            type: 'documents:redis',
            key: uuidv5(
              toUtf8Bytes('default-2'), // <!-- what should this be?
              uuidv5(decodedConfig.url, uuidv5.URL),
            ),
          },
        },
      ]

      /**
       * Create a new config
       */
      const addedFeedValueConfig = upgradeConfig(decodedConfig, appendedFeeds)

      /**
       * Save the upgraded config
       */
      await client.set(key, addedFeedValueConfig)
      console.log('Upgraded', key)

      /**
       * Copy posts content
       */
      const oldId = 'default'
      const newId = 'default-2'
      const res = await fetch(
        `https://${addedFeedValueConfig.url}/api/devprotocol:clubs:plugin:posts/${oldId}/copy/to/${newId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (res.status !== 200) {
        console.log('Failed to copy posts content', key)
        continue
      }

      /**
       * Remove the prior feed value
       */
      const removedFeeds = feeds.value.filter((feed) => feed.id !== oldId)
      const upgradedConfig = upgradeConfig(decodedConfig, removedFeeds)

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
