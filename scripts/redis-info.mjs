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

  let connections = 0

  setInterval(async () => {
    const info = await client.info('clients')
    // console.log('connections: ', info)
    const lines = info.split('\n')
    const connectedClientsLine = lines.find((line) =>
      line.startsWith('connected_clients:'),
    )
    /**
     * Parse the number of connected clients
     */
    if (connectedClientsLine) {
      const connectedClients = +connectedClientsLine.split(':')[1]

      /**
       * Only log when the number of connections has changed
       * so we don't jam up the console
       */
      if (connections !== connectedClients) {
        connections = connectedClients

        // get the time in the local timezone
        const now = new Date().toLocaleString()

        console.log(`${now}: connected_clients: ${connectedClients}`)
      }
    }
  }, 1000)

  // Handle Ctrl+C
  process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down...')
    // client.quit(() => {
    //   process.exit();
    // });
    const success = await client.quit()
    console.log('client quit? ', success)
    process.exit()
  })
}

main()
