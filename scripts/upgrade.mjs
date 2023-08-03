import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'

dotenv.config()

const upgrade = (key, config) => {
  const deocdedConfig = decode(config)
  const upgradedConfig = { ...deocdedConfig }

  if (upgradedConfig.url.includes('<USERS_SITE_NAME_HERE>')) {
    console.log(key, 'has <USERS_SITE_NAME_HERE> on `url`')

    upgradedConfig.url = `https://${key}.clubs.place`
  }

  upgradedConfig.plugins = upgradedConfig.plugins.map((plg) => {
    if (plg.id) {
      // no need to upgrade
      return plg
    }
    return plg.name === 'admin'
      ? { ...plg, id: 'clubs-core:admin' }
      : plg.name === 'defaultTheme'
      ? { ...plg, id: 'devprotocol:clubs:theme-1' }
      : plg.name === 'join'
      ? { ...plg, id: 'devprotocol:clubs:plugin:join' }
      : plg.name === 'me'
      ? { ...plg, id: 'devprotocol:clubs:plugin:me' }
      : plg.name === 'community'
      ? { ...plg, id: 'devprotocol:clubs:plugin:community' }
      : plg.name === 'quests'
      ? { ...plg, id: 'devprotocol:clubs:plugin:quests' }
      : plg.name === 'members'
      ? { ...plg, id: 'devprotocol:clubs:plugin:members' }
      : plg.name === 'memberships'
      ? { ...plg, id: 'devprotocol:clubs:simple-memberships' }
      : plg.name === 'message'
      ? { ...plg, id: 'devprotocol:clubs:gated-contact-form' }
      : plg.name === 'marketplace'
      ? { ...plg, id: 'devprotocol:clubs:clubsx:marketplace' }
      : plg.name === 'perks'
      ? { ...plg, id: 'devprotocol:clubs:plugin:perks' }
      : plg.name === 'fiat'
      ? { ...plg, id: 'devprotocol:clubs:plugin:fiat' }
      : plg.name === 'buy'
      ? { ...plg, id: 'devprotocol:clubs:plugin:buy' }
      : plg.name === 'nft'
      ? { ...plg, id: 'devprotocol:clubs:plugin:nft' }
      : (() => {
          console.error(
            key,
            plg.name,
            'This plugin does not have a suitable upgrade script',
          )
          return plg
        })()
  })

  if (
    upgradedConfig.plugins.every(
      (p) => p.id !== 'devprotocol:clubs:clubsx:marketplace',
    )
  ) {
    console.log(key, 'has not marketplace on `plugins`')

    upgradedConfig.plugins = [
      ...upgradedConfig.plugins,
      { id: 'devprotocol:clubs:clubsx:marketplace', options: [] },
    ]
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
