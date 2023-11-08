import { encode, decode } from '@devprotocol/clubs-core'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'
import jsonwebtoken from 'jsonwebtoken'

const KEY = 'hotel'

const { SALT } = process.env

const populate = async (client) => {
  const base = decode(await client.get(KEY))
  const ticketWebhook = jsonwebtoken.sign(
    `https://clubs-userland-template.vercel.app/api/webhooks/tickets/template/dest/airtable/tbley5joim77xMPaR`,
    SALT,
  )

  await client.set(
    KEY,
    encode({
      ...base,
      plugins: [
        ...base.plugins.filter(
          ({ id }) =>
            id !== 'devprotocol:clubs:plugin:clubs-payments' &&
            id !== 'devprotocol:clubs:plugin:tickets',
        ),
        {
          id: 'devprotocol:clubs:plugin:clubs-payments',
          name: 'fiat',
          enable: true,
          options: [
            {
              key: 'override',
              value: [
                {
                  id: '----------2',
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload:
                    '0x98358cf2bb54ee7a29f874ca838f268c2a2c8dd7f419e7dd8023d97d643e907b',
                  price: {
                    yen: 3500,
                  },
                },
                {
                  id: '---------',
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload:
                    '0x4ceadd28ce51f2e255a42171ec6d6b44942a5556eddddc1478693f0ea1c7ad7b',
                  price: {
                    yen: 1200,
                  },
                },
                {
                  id: '-------1----2',
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload:
                    '0x0589b5a6b000a6f19d9d41f5a2a90b7db9f4428d8b9210d7163328e0989c7bd0',
                  price: {
                    yen: 30000,
                  },
                },
              ],
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
                  payload:
                    '0x98358cf2bb54ee7a29f874ca838f268c2a2c8dd7f419e7dd8023d97d643e907b',
                  importedFrom: {
                    plugin: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                  },
                  name: 'モーニングチケット',
                  uses: [
                    {
                      id: 'morning',
                      name: 'モーニングチケット',
                      description:
                        '季節の食材を用いたサラダ、こだわりのパンやスイーツをお好きなだけお楽しみ頂けます。',
                      duration: '1 days',
                      within: '1 months',
                      availability: [
                        {
                          type: 'weekday-time',
                          weekday: 1,
                          start: '7 hour',
                          end: '10 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 2,
                          start: '7 hour',
                          end: '10 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 3,
                          start: '7 hour',
                          end: '10 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 4,
                          start: '7 hour',
                          end: '10 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 5,
                          start: '7 hour',
                          end: '10 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 6,
                          start: '7 hour',
                          end: '11 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 7,
                          start: '7 hour',
                          end: '11 hour',
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
                  payload:
                    '0x4ceadd28ce51f2e255a42171ec6d6b44942a5556eddddc1478693f0ea1c7ad7b',
                  importedFrom: {
                    plugin: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                  },
                  name: '名物ラテアート☕️',
                  uses: [
                    {
                      id: 'latte-art',
                      name: '名物ラテアート☕️',
                      description:
                        '見た目も楽しめる、大人気のラテアートです。ペットの写真を見せて頂ければ、カスタマイズも出来ます🐶🐱🦜',
                      duration: '1 days',
                      within: '1 months',
                      availability: [
                        {
                          type: 'weekday-time',
                          weekday: 1,
                          start: '11 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 2,
                          start: '11 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 3,
                          start: '11 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 4,
                          start: '11 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 5,
                          start: '11 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 6,
                          start: '11 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 7,
                          start: '11 hour',
                          end: '21 hour',
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
                  payload:
                    '0x0589b5a6b000a6f19d9d41f5a2a90b7db9f4428d8b9210d7163328e0989c7bd0',
                  importedFrom: {
                    plugin: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                  },
                  name: 'ラウンジ会員《1週間》',
                  uses: [
                    {
                      id: 'one-week-access',
                      name: 'ラウンジ会員《1週間》',
                      description:
                        'ホテル1階にあるラウンジを1週間、ご利用頂けます。お飲み物や軽食をご用意しておりますので、長期滞在中のお仕事やリフレッシュの場としてお過ごしください。',
                      duration: '1 weeks',
                      within: '1 months',
                      availability: [
                        {
                          type: 'weekday-time',
                          weekday: 1,
                          start: '7 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 2,
                          start: '7 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 3,
                          start: '7 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 4,
                          start: '7 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 5,
                          start: '7 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 6,
                          start: '7 hour',
                          end: '21 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 7,
                          start: '7 hour',
                          end: '21 hour',
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
              ],
            },
          ],
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
