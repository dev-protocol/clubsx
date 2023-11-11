import dotenv from 'dotenv'
import { encodeIfValid } from './validators/cryptocafe.mjs'
import fs from 'fs-extra'
import jsonwebtoken from 'jsonwebtoken'
import { cryptoCafeMemberships } from './constants/cryptocafe.mjs'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'

dotenv.config()

const KEY = 'cryptocafe'

const { SALT } = process.env

const populate = async (client) => {
  const ticketWebhook = jsonwebtoken.sign(
    `https://clubs-userland-cryptocafe.vercel.app/api/webhooks/tickets/${
      process.env.CRYPTOCAFE_TICKET_WEBHOOK_KEY ?? 'XYZ'
    }/dest/airtable/tblPinFQ8dUbrhzPn`,
    SALT,
  )
  await client.set(
    KEY,
    encodeIfValid({
      name: 'Crypto Cafe & Bar',
      twitterHandle: '',
      description: `Daytime co-working, nighttime vibing.`,
      url: 'https://cryptocafe.clubs.place',
      propertyAddress: '0xF1AA1fC5a248bDCF531E45447916d49d54212AdE',
      chainId: 137, // Polygon: 137 // Mumbai: 80001
      rpcUrl:
        'https://polygon-mainnet.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920', // Polygon: https://polygon-mainnet.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920 // Mumbai: https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920
      adminRolePoints: 50,
      options: [
        {
          key: 'ogp',
          value: { image: 'https://i.imgur.com/IqkJqwc.jpg' },
        },
        {
          key: 'navigationLinks',
          value: [
            {
              display: 'Tickets',
              path: '/tickets',
            },
          ],
        },
        {
          key: 'avatarImgSrc',
          value: 'https://i.imgur.com/8wc0qH5.png',
        },
      ],
      plugins: [
        {
          name: 'admin',
          options: [],
          id: 'clubs-core:admin',
        },
        {
          id: 'devprotocol:clubs:plugin:clubs-payments',
          name: 'fiat',
          enable: true,
          options: [
            {
              key: 'override',
              value: [
                {
                  id: cryptoCafeMemberships[0].id,
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload: cryptoCafeMemberships[0].payload,
                  price: {
                    yen: 2000,
                  },
                },
                {
                  id: cryptoCafeMemberships[1].id,
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload: cryptoCafeMemberships[1].payload,
                  price: {
                    yen: 2000,
                  },
                },
                {
                  id: cryptoCafeMemberships[2].id,
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload: cryptoCafeMemberships[2].payload,
                  price: {
                    yen: 3000,
                  },
                },
                {
                  id: cryptoCafeMemberships[3].id,
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload: cryptoCafeMemberships[3].payload,
                  price: {
                    yen: 45000,
                  },
                },
                {
                  id: cryptoCafeMemberships[4].id,
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload: cryptoCafeMemberships[4].payload,
                  price: {
                    yen: 110000,
                  },
                },
              ],
            },
            {
              key: 'webhooks',
              value: {
                fulfillment: {
                  encrypted: jsonwebtoken.sign(
                    'https://veritrans.clubs.place/api/mock/logger',
                    SALT,
                  ),
                },
              },
            },
          ],
        },
        {
          id: 'devprotocol:clubs:plugin:tickets',
          options: [
            {
              key: 'tickets',
              value: [
                {
                  // Cafe Visitor
                  payload: cryptoCafeMemberships[0].payload,
                  importedFrom: {
                    plugin: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                  },
                  name: cryptoCafeMemberships[0].name,
                  uses: [
                    {
                      id: 'one-time-cafe-access',
                      name: 'One-time access (Any weekday)',
                      description: cryptoCafeMemberships[0].description,
                      duration: '1 days',
                      within: '1 months',
                      availability: [
                        {
                          type: 'weekday-time',
                          weekday: 1,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 2,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 3,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 4,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 5,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                      ],
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
                  // Bar Visitor
                  payload: cryptoCafeMemberships[1].payload,
                  importedFrom: {
                    plugin: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                  },
                  name: cryptoCafeMemberships[1].name,
                  uses: [
                    {
                      id: 'one-time-bar-access',
                      name: 'One-time access (Tuesday or Friday)',
                      description: cryptoCafeMemberships[1].description,
                      duration: '1 days',
                      within: '1 months',
                      availability: [
                        {
                          type: 'weekday-time',
                          weekday: 2,
                          start: '18 hour',
                          end: '22 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 5,
                          start: '18 hour',
                          end: '22 hour',
                          tz: 'Asia/Tokyo',
                        },
                      ],
                      refreshCycle: undefined,
                    },
                    {
                      id: 'complimentary-drink',
                      name: 'Complimentary drink',
                      description: 'ドリンク 1 杯無料',
                      dependsOn: 'one-time-bar-access',
                      refreshCycle: '1 days',
                    },
                  ],
                  webhooks: {
                    used: {
                      encrypted: ticketWebhook,
                    },
                  },
                },
                {
                  // One Day
                  payload: cryptoCafeMemberships[2].payload,
                  importedFrom: {
                    plugin: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                  },
                  name: cryptoCafeMemberships[2].name,
                  uses: [
                    {
                      id: 'one-day-access',
                      name: 'Full day access to our cafe & bar (Tuesday or Friday)',
                      description: cryptoCafeMemberships[2].description,
                      duration: '1 days',
                      within: '1 months',
                      availability: [
                        {
                          type: 'weekday-time',
                          weekday: 2,
                          start: '10 hour',
                          end: '22 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 5,
                          start: '10 hour',
                          end: '22 hour',
                          tz: 'Asia/Tokyo',
                        },
                      ],
                      refreshCycle: undefined,
                    },
                    {
                      id: 'complimentary-drink',
                      name: 'Complimentary drink',
                      description: 'ドリンク 1 杯無料',
                      dependsOn: 'one-day-access',
                      refreshCycle: '1 days',
                    },
                  ],
                  webhooks: {
                    used: {
                      encrypted: ticketWebhook,
                    },
                  },
                },
                {
                  // Friend Pass
                  payload: cryptoCafeMemberships[3].payload,
                  importedFrom: {
                    plugin: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                  },
                  name: cryptoCafeMemberships[3].name,
                  uses: [
                    {
                      id: 'one-month-access',
                      name: 'One month access',
                      description: cryptoCafeMemberships[3].description,
                      duration: '1 months',
                      within: '1 months',
                      availability: [
                        {
                          type: 'weekday-time',
                          weekday: 1,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 2,
                          start: '10 hour',
                          end: '22 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 3,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 4,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 5,
                          start: '10 hour',
                          end: '22 hour',
                          tz: 'Asia/Tokyo',
                        },
                      ],
                      refreshCycle: undefined,
                    },
                    {
                      id: 'invite-guest',
                      name: 'Invite 1 guest',
                      description: 'ゲスト 1 人無料',
                      dependsOn: 'one-month-access',
                      refreshCycle: '1 days',
                    },
                    {
                      id: 'complimentary-drink',
                      name: 'Complimentary drink',
                      description: 'ドリンク 1 杯無料',
                      dependsOn: 'one-month-access',
                      refreshCycle: '1 days',
                    },
                  ],
                  webhooks: {
                    used: {
                      encrypted: ticketWebhook,
                    },
                  },
                },
                {
                  // Best Friend Pass
                  payload: cryptoCafeMemberships[4].payload,
                  importedFrom: {
                    plugin: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                  },
                  name: cryptoCafeMemberships[4].name,
                  uses: [
                    {
                      id: '3-months-access',
                      name: '3 months access',
                      description: cryptoCafeMemberships[4].description,
                      duration: '3 months',
                      within: '1 months',
                      availability: [
                        {
                          type: 'weekday-time',
                          weekday: 1,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 2,
                          start: '10 hour',
                          end: '22 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 3,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 4,
                          start: '10 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 5,
                          start: '10 hour',
                          end: '22 hour',
                          tz: 'Asia/Tokyo',
                        },
                      ],
                      refreshCycle: undefined,
                    },
                    {
                      id: 'invite-guest',
                      name: 'Invite 1 guest',
                      description: 'ゲスト 1 人無料',
                      dependsOn: '3-months-access',
                      refreshCycle: '1 days',
                    },
                    {
                      id: 'complimentary-drink',
                      name: 'Complimentary drink',
                      description: 'ドリンク 1 杯無料',
                      dependsOn: '3-months-access',
                      refreshCycle: '1 days',
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
        },
        {
          id: 'devprotocol:clubs:simple-memberships',
          name: 'memberships',
          enable: true,
          options: [
            {
              key: 'memberships',
              value: cryptoCafeMemberships,
            },
          ],
        },
        {
          id: 'devprotocol:clubs:theme-1',
          name: 'defaultTheme',
          enable: true,
          options: [
            {
              key: 'globalConfig',
              value: {
                bg: 'rgba(29, 36, 38, 1)',
              },
            },
            {
              key: 'homeConfig',
              value: {
                hero: {
                  image: 'https://i.imgur.com/xp2uJYe.jpg',
                },
                description: `Daytime co-working, nighttime vibing.`,
                body: fs.readFileSync(
                  './src/assets/homeConfig.cryptocafe.body.md',
                  'utf-8',
                ),
              },
            },
          ],
        },
        {
          id: 'devprotocol:clubs:plugin:me',
          name: 'me',
          enable: true,
          options: [],
        },
        {
          id: 'devprotocol:clubs:plugin:join',
          name: 'join',
          enable: true,
          options: [],
        },
      ],
    }),
  )

  console.log('set', KEY)
}

whenCalledDirectly(async () => {
  const client = await db()
  await populate(client)
  await client.quit()
})

export default populate
