import { createClient } from 'redis'
import dotenv from 'dotenv'
import { scanOnlyClubs } from './lib.scanOnlyClubs.mjs'
import fetch from 'cross-fetch'
import { has } from '@vercel/edge-config'
import { tryCatch } from 'ramda'

dotenv.config()

const { VERCEL_API_TOKEN, EDGE_CONFIG } = process.env
const edgeConfigId = ((url) => url.pathname.slice(1, Infinity))(
  new URL(EDGE_CONFIG),
)

const callEdgeConfigToWrite = async (key) =>
  tryCatch(
    () =>
      fetch(
        `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items?teamId=devprtcl`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${VERCEL_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              {
                operation: 'create',
                key,
                value: 1,
              },
            ],
          }),
        },
      ).then(async (r) => {
        return r.ok
      }),
    (err) => {
      console.log('$edgeconfigset$', err)
      return Promise.resolve(false)
    },
  )()

const app = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    for await (const key of scanOnlyClubs(client)) {
      if (key.includes(':')) {
        // This is not a ClubsConfiguration
        console.log('Skipped:', key)
        continue
      }

      if (await has(key)) {
        console.log('Already added', key)
        continue
      }

      console.log('Detect:', key)
      await callEdgeConfigToWrite(key)
    }

    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
