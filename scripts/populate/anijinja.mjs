import { encode, decode } from '@devprotocol/clubs-core'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'

const KEY = 'anijinja'

const populate = async (client) => {
  const config = decode(await client.get(KEY))
  await client.set(
    KEY,
    encode({
      ...config,
      plugins: [
        ...config.plugins.filter(
          ({ id }) =>
            id !== 'devprotocol:clubs:plugin:clubs-payments' &&
            id !== 'devprotocol:clubs:plugin:pay-by-card',
        ),
        {
          id: 'devprotocol:clubs:plugin:clubs-payments',
          enable: true,
          options: [
            {
              key: 'override',
              value: [
                {
                  id: 'fantasy',
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload:
                    '0xcafac4d96b5abdd14bc82e1bb67f7c80d0ed170527510bef42b636f38f5262ac',
                  price: {
                    yen: 1500,
                  },
                },
                {
                  id: 'mecha',
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload:
                    '0x634864bc5ea9d288635de2c924d5936041ffea7149df086d526ff093d0c3db72',
                  price: {
                    yen: 1500,
                  },
                },
                {
                  id: 'action',
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload:
                    '0x489683382ccd954c6cb0ab516a99079d303342211f82011fe84ccaa301ed7b1e',
                  price: {
                    yen: 1500,
                  },
                },
                {
                  id: 'sci-fi',
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload:
                    '0x631a97eea2dece26c8b6e7ea8914d08d71393f165c4f59ccd9c5d11c5fa05788',
                  price: {
                    yen: 1500,
                  },
                },
                {
                  id: 'school-life',
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload:
                    '0xb25f6e8b8cbdc16e5707f08fba03bc3bde1d475caa276382c0fe23662d8d6bac',
                  price: {
                    yen: 1500,
                  },
                },
                {
                  id: 'mystery',
                  importFrom: 'devprotocol:clubs:simple-memberships',
                  key: 'memberships',
                  payload:
                    '0x307fee8397487ecbd4ce545f2d663e9d20c989dfed94a693c4d4457773a39372',
                  price: {
                    yen: 1500,
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
