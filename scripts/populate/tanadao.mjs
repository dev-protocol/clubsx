import { decode } from '@devprotocol/clubs-core'
import { override } from './constants/tanadao.mjs'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'
import { encodeIfValid } from './validators/tanadao.mjs'

const KEY = 'tanadao'

const populate = async (client) => {
  const srcConfig = decode(await client.get(KEY))
  await client.set(
    KEY,
    encodeIfValid({
      ...srcConfig,
      plugins: srcConfig.plugins.map((plugin) =>
        plugin.id === 'devprotocol:clubs:plugin:clubs-payments'
          ? {
              ...plugin,
              options: [
                {
                  key: 'override',
                  value: override,
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
