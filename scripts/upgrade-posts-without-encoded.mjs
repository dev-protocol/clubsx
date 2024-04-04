import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'
import { scanOnlyClubs } from './lib.scanOnlyClubs.mjs'

dotenv.config()

const FEEDS = 'feeds'
const ENCODED_REDIS = 'encoded:redis'

const upgrade = (key, config) => {
  const deocdedConfig = decode(config)
  const upgradedConfig = { ...deocdedConfig }

  upgradedConfig.plugins = upgradedConfig.plugins.map((plugin) => {
    if (
      plugin.id === 'devprotocol:clubs:plugin:posts' &&
      plugin.options.some(
        (opt) =>
          opt.key === FEEDS &&
          opt.value.some((feed) => feed.database.type === ENCODED_REDIS),
      )
    ) {
      const feeds = plugin.options?.find((opt) => opt.key === FEEDS) ?? {
        key: FEEDS,
        value: [],
      }

      const oldFeeds = {
        key: '_old_feeds_',
        value: feeds.value.filter(
          (feed) => feed.database.type === ENCODED_REDIS,
        ),
      }

      // Filter out the feeds with type 'encoded:redis'
      feeds.value = feeds.value.filter(
        (feed) => feed.database.type !== ENCODED_REDIS,
      )

      feeds.value =
        // If there is only one feed, set the id 'default' to the feed
        feeds.value.length === 1
          ? feeds.value.map((feed) => ({ ...feed, id: 'default' }))
          : feeds.value

      const next = {
        ...plugin,
        options: [
          ...plugin.options.filter((opt) => opt.key !== FEEDS),
          feeds,
          oldFeeds,
        ],
      }

      console.log(key, next)
      return next
    }

    // No changes
    return plugin
  })

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

    const allChanges = new Set()
    for await (const key of scanOnlyClubs(client)) {
      if (key.includes(':')) {
        // This is not a ClubsConfiguration
        // console.log('Skip', key)
        continue
      }

      console.log('◆ Run', key)

      client.get(key).then(async (encodedConfig) => {
        const upgradedConfig = upgrade(key, encodedConfig)
        if (encodedConfig === upgradedConfig) {
          console.log('No changes', key)
          return
        }

        console.log('🔷 Detect changes', key)

        await client.set(key, upgradedConfig)
        console.log('Upgraded:', key)

        allChanges.add(key)
      })
    }

    console.log('All changes:', Array.from(allChanges))

    console.log('DB Upgraded')
    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
