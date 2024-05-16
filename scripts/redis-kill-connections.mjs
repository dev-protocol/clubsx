import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

/**
 * When we need to manually kill all connections to Redis
 */
const main = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })

  await client.connect()

  // Get a list of all clients

  const clientsList = await client.sendCommand(['CLIENT', 'LIST']) // Use an array of RedisCommandArguments

  console.log('clientsList: ', clientsList)

  // // Parse the clients list and get the IDs of all clients
  const clientIds = clientsList
    .split('\n')
    .filter((line) => line)
    .map((line) => {
      const match = line.match(/id=(\d+)/)
      return match ? match[1] : null
    })
    .filter((id) => id !== null)

  console.log('clientIds: ', clientIds)

  // // Disconnect each client
  for (const id of clientIds) {
    await client.sendCommand(['CLIENT', 'KILL', 'ID', id])
  }

  await client.quit()
}

main()
