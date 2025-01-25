import reservedNamespacies from '@constants/reserved-namespacies'
import { createClient } from 'redis'
import BadWords from 'bad-words'
import { validate } from '@fixtures/site'

export const GET = async ({
  params: { site },
}: {
  params: { site?: string }
}) => {
  const validNaming = validate(site)
  const notReserved = reservedNamespacies.includes(site ?? '') === false
  const isProfane = new BadWords().isProfane(site?.toLowerCase() ?? '')

  const client =
    validNaming && notReserved && !isProfane
      ? createClient({
          url: process.env.REDIS_URL,
          username: process.env.REDIS_USERNAME ?? '',
          password: process.env.REDIS_PASSWORD ?? '',
          socket: {
            keepAlive: 1,
            reconnectStrategy: 1,
          },
        })
      : undefined
  await client?.connect()

  client?.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  const count = await client?.exists(site as string)
  const validNamespace = typeof count === 'number' ? count === 0 : undefined

  try {
    await client?.quit()
    const body =
      !validNaming || !notReserved
        ? { error: 'Invalid naming' }
        : !validNamespace
          ? { error: 'Aleady exists' }
          : {}
    const status = validNaming && validNamespace ? 200 : 400
    return new Response(JSON.stringify(body), { status })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
