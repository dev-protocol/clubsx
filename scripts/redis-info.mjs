import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

/**
 * This was made with the intention to give some transparency
 * to the max connections issue we have been facing.
 *
 * Specifically, if you scroll to the "Clients" section in the log after running,
 * it will tell the number of connected_clients, and maxclients
 */
const main = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })

  await client.connect()

  const info = await client.info('all')
  console.log(info)

  await client.quit()
}

main()
