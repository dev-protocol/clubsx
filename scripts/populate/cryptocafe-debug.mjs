import { encode, decode } from '@devprotocol/clubs-core'
import { cryptoCafeMemberships } from './constants/cryptocafe.mjs'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'

const KEY = 'cryptocafe-debug'

const populate = async (client) => {
  const cryptocafeConfig = decode(await client.get('cryptocafe'))
  await client.set(
    KEY,
    encode({
      ...cryptocafeConfig,
      url: 'https://cryptocafe.prerelease.clubs.place',
      propertyAddress: '0xE59fEDaBB0F79b0EC605737805a9125cd8d87B1f',
      chainId: 80001, // Polygon: 137 // Mumbai: 80001
      rpcUrl:
        'https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920', // Polygon: https://polygon-mainnet.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920 // Mumbai: https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920
      plugins: cryptocafeConfig.plugins.map((plugin) =>
        plugin.id === 'devprotocol:clubs:simple-memberships'
          ? {
              ...plugin,
              options: [
                {
                  key: 'memberships',
                  value: cryptoCafeMemberships.map((membership) => ({
                    ...membership,
                    price: membership.price / 100_000,
                  })),
                },
              ],
            }
          : plugin.id === 'devprotocol:clubs:plugin:tickets'
          ? {
              ...plugin,
              options: [
                {
                  key: 'tickets',
                  value: plugin.options
                    .find((p) => p.key === 'tickets')
                    .value.map((v) => ({ ...v, webhooks: undefined })),
                },
              ],
            }
          : plugin,
      ),
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
