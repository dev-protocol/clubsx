import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'

dotenv.config()

const KEY = 'test-mizu'

const createAvailabilities = (startHour, endHour) => {
  return Array.from({ length: 5 }, (_, i) => ({
    type: 'weekday-time',
    weekday: i + 1,
    start: `${startHour} hour`,
    end: `${endHour} hour`,
    tz: 'Asia/Tokyo',
  }))
}

const ticketWebhook =
  'https://clubs-userland-mw-test.vercel.app/api/webhooks/tickets/Fbd64p/dest/airtable/{AIRTABLE_TABLE_ID}'

const upgrade = (config) => {
  const deocdedConfig = decode(config)
  const upgradedConfig = { ...deocdedConfig }

  /**
   * Write upgrading script here
   */
  const metawaterTicketsPlugin = {
    id: 'devprotocol:clubs:plugin:tickets',
    options: [
      {
        key: 'tickets',
        value: [
          {
            // Regional Coupon
            payload:
              '0x4873ac86f0764d57d7e71d276c7341ec9532d1dc6a4fdf6997220723a643ee32',
            importedFrom: {
              plugin: 'devprotocol:clubs:simple-memberships',
              key: 'memberships',
            },
            name: '地域クーポン',
            uses: [
              {
                id: '500yen',
                name: '500円',
                description: '地域クーポン（500円分）として使用できます',
                duration: '1 hour',
                within: '1 year',
                availability: createAvailabilities(9, 22),
                refreshCycle: undefined,
              },
            ],
            webhooks: {
              used: {
                encrypted: ticketWebhook,
              },
            },
          },
          {
            // Proof of service NFT
            payload: '0xAA821D4397B6253BF5d42a9e6B6AaE6B5C52723d', // this is the achievement NFT address
            importedFrom: {
              plugin: 'devprotocol:clubs:simple-memberships',
              key: 'memberships',
            },
            name: '役務証明報酬チケット',
            uses: [
              {
                id: 'proof-of-service',
                name: '​報酬引き換え',
                description: 'NFTに表示されている報酬額と引き換えられます',
                duration: '1 hour',
                within: '1 year',
                availability: createAvailabilities(9, 18),
                refreshCycle: undefined,
              },
            ],
            webhooks: {
              used: {
                encrypted: ticketWebhook,
              },
            },
          },
        ],
      },
    ],
  }

  upgradedConfig.plugins = [...upgradedConfig.plugins, metawaterTicketsPlugin]

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

    const encodedConfig = await client.get(KEY)
    const upgradedConfig = upgrade(encodedConfig)

    if (encodedConfig === upgradedConfig) {
      console.log('Up-to-date', KEY)
    } else {
      await client.set(KEY, upgradedConfig)
      console.log('Upgraded:', KEY)
      console.log('DB Upgraded')
    }

    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
