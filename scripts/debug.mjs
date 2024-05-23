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

  const info = await client.ft.info('idx::devprotocol:clubs:achievement:info')
  console.log(info)

  const data = await client.json.get(
    'doc::devprotocol:clubs:achievement:info::0y468126eb8d4280ef421709f602e27b35e5c876200ebbdbc1dd8450cadf656f9e',
  )
  console.log(data)

  // console.log(
  //   await client.json.set(
  //     'doc::devprotocol:clubs:achievement:info::0y468126eb8d4280ef421709f602e27b35e5c876200ebbdbc1dd8450cadf656f9e',
  //     '$',
  //     {
  //       ...data,
  //       id: '0y468126eb8d4280ef421709f602e27b35e5c876200ebbdbc1dd8450cadf656f9e',
  //     },
  //   ),
  // )

  // console.log(
  //   await client.ft.alter('idx::devprotocol:clubs:achievement:info', {}),
  // )
  console.log(
    await client.ft.search('idx::devprotocol:clubs:achievement:info', '*'),
  )

  await client.quit()
}

main()
