import { encode, decode } from '@devprotocol/clubs-core'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'

const KEY = 'aggre-demo-std-2'

const populate = async (client) => {
  const base = decode(await client.get(KEY))
  await client.set(
    KEY,
    encode({
      ...base,
      rpcUrl:
        'https://polygon-mumbai.g.alchemy.com/v2/sOgoydFGM3-T4emXVlgtyyrZyAstO036',
      plugins: [
        ...base.plugins.filter(
          (plg) => plg.id !== 'devprotocol:clubs:plugin:tickets',
        ),
        {
          id: 'devprotocol:clubs:plugin:tickets',
          options: [
            {
              key: 'tickets',
              value: [
                {
                  erc721Enumerable:
                    '0xe0af15141ABd0B31Fb15e250971936Fe8837230a',
                  name: 'Debug SBT ticket',
                  uses: [
                    {
                      id: 'one-time-cafe-access',
                      name: 'Coupon ABC',
                      description:
                        'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                      duration: '40 minutes',
                      within: '12 months',
                      availability: [
                        {
                          type: 'weekday-time',
                          weekday: 1,
                          start: '9 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 2,
                          start: '9 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 3,
                          start: '9 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 4,
                          start: '9 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                        {
                          type: 'weekday-time',
                          weekday: 5,
                          start: '9 hour',
                          end: '18 hour',
                          tz: 'Asia/Tokyo',
                        },
                      ],
                      refreshCycle: undefined,
                    },
                  ],
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
