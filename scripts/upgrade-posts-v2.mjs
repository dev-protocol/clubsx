import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'
import { v5 as uuidv5 } from 'uuid'
import { toUtf8Bytes } from 'ethers'

dotenv.config()

let isIndexCreated = false

const upgradeConfig = (decodedConfig, feeds) => {
  const upgradedConfig = {
    ...decodedConfig,
    plugins: decodedConfig.plugins.map((plugin) => {
      /**
       * Find the posts plugin
       */
      if (plugin.id === 'devprotocol:clubs:plugin:posts') {
        /**
         * Find the feeds option and replace it with the new one
         */
        const options = plugin.options.map((option) => {
          if (option.key === 'feeds') {
            return {
              key: 'feeds',
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
     * Drop the indexes
     */
    await Promise.all([
      client.ft.dropindex('idx::devprotocol:clubs:plugin:posts::post'),
      client.ft.dropindex('idx::devprotocol:clubs:plugin:posts::comment'),
      client.ft.dropindex('idx::devprotocol:clubs:plugin:posts::reaction'),
      client.ft.dropindex('idx::devprotocol:clubs:plugin:posts::option'),
    ])

    /**
     * Loop through the redis keys
     */
    for await (const key of client.scanIterator()) {
      if (key.includes(':')) {
        // This is not a ClubsConfiguration
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
        (plugin) => plugin.id === 'devprotocol:clubs:plugin:posts',
      )

      /** Club doesn't have Posts installed, continue */
      if (!pluginPost) {
        console.log('Skipped: no post plugin', key)
        continue
      }

      /**
       * Find the feeds option
       **/
      const feeds = pluginPost.options.find((option) => option.key === 'feeds')

      /** Club doesn't have Posts installed, continue */
      if (!feeds) {
        console.log('Skipped: no feeds found', key)
        continue
      }

      /**
       * We add the new feed value for copying the posts content
       */
      const scope = uuidv5(
        toUtf8Bytes('default-2'),
        uuidv5(decodedConfig.url, uuidv5.URL),
      )
      const appendedFeeds = [
        ...feeds.value.filter((feed) => feed.database.key !== scope),
        {
          id: 'default-2',
          slug: 'posts',
          database: {
            type: 'documents:redis',
            key: scope,
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
       * Create required indexes
       * This API can be called repeatedly, but it has no effect after the first call, so call it only once.
       */
      if (isIndexCreated === false) {
        const res1 = await fetch(
          `http://localhost:3000/sites_/${key}/api/devprotocol:clubs:plugin:posts/indexing/documents:redis`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        if (!res1.ok) {
          console.log('status is: ', res1.status)
          console.log('status text is: ', res1.statusText)
          console.log('Failed to create indexes', key)
          console.log('----')
          continue
        }
        isIndexCreated = true
      }

      /**
       * Copy posts content
       */
      const oldId = 'default'
      const newId = 'default-2'
      const copyUrl = `http://localhost:3000/sites_/${key}/api/devprotocol:clubs:plugin:posts/${oldId}/copy/to/${newId}`
      console.log('Copying posts content', key, copyUrl)

      const res2 = await fetch(copyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res2.ok) {
        console.log('status is: ', res2.status)
        console.log('status text is: ', res2.statusText)
        console.log('Failed to copy posts content', key)
        console.log('----')
        continue
      }

      /**
       * Remove the prior feed value
       */
      const removedFeeds = appendedFeeds.map((feed) =>
        feed.id === oldId ? { ...feed, slug: '_old_default_feed' } : feed,
      )
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
