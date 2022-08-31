import { createClient } from 'redis'

export const get = async ({ userAddress }: { userAddress: string }) => {
  // const { id } = params;
  // console.log('id is: ', id)

  // redis[s]://[[username][:password]@][host][:port][/db-number]

  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })

  await client.connect()

  client.on('error', (e) => {
    console.log('an error occurred: ', e)
  })

  // client.json.set('test', '$', { hello: 'world' })
  const res = await client.json.get('test')
  return res
}
