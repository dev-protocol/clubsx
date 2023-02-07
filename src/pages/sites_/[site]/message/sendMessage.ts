import { utils, providers, ethers, Signer } from 'ethers'
import { createClient } from 'redis'
import { authenticate, decode } from '@devprotocol/clubs-core'
import { checkMemberships } from '@fixtures/utility'
import type { UndefinedOr } from '@devprotocol/util-ts'
import type { GatedMessage } from '@plugins/message/types'

export const post = async ({ request }: { request: Request }) => {
  const { pluginIndex, site, data, sig, hash, userAddress, propertyAddress } =
    (await request.json()) as {
      pluginIndex?: number
      site: string
      data: {
        fullname: string
        addressLine1: string
        addressLine2: string
        zipCode: string
        city: string
        country: string
        formId: string
      }
      hash: string
      sig: string
      userAddress: string
      propertyAddress: string
    }

  // Check that the user has signed the message.
  const verificationDigest = utils.hashMessage(hash)
  const recoveredSigner = utils.recoverAddress(verificationDigest, sig)
  if (recoveredSigner.toLowerCase() !== userAddress.toLowerCase()) {
    return new Response(JSON.stringify({ error: 'Invalid signer' }), {
      status: 404,
    })
  }

  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
    socket: {
      keepAlive: 1,
      reconnectStrategy: 1,
    },
  })
  await client.connect()

  client.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  const previousConfiguration = await client.get(site)
  await client.quit()
  if (!previousConfiguration) {
    return new Response(JSON.stringify({ error: 'Encoded config not found' }), {
      status: 401,
    })
  }

  // Check for form data validity.
  const configuration = decode(previousConfiguration)
  const formData = (
    configuration.plugins?.[pluginIndex ?? 0]?.options?.find(
      (element) => element.key === 'forms'
    )?.value as UndefinedOr<GatedMessage[]>
  )?.find((element) => element.id === data.formId)
  if (!formData) {
    return new Response(JSON.stringify({ error: 'Form details not found' }), {
      status: 401,
    })
  }

  // Check for required membership validity
  try {
    const web3Provider = new ethers.providers.JsonRpcProvider(
      decode(previousConfiguration).rpcUrl
    )
    const isMember = await checkMemberships(
      web3Provider,
      propertyAddress,
      // @ts-ignore
      formData.requiredMemberships,
      userAddress
    ).catch((err) => {
      throw Error('Not a member')
    })

    if (!isMember) {
      throw Error('Not a member')
    }
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  const provider = providers.getDefaultProvider(
    decode(previousConfiguration).rpcUrl
  )
  const authenticated = await authenticate({
    message: hash,
    signature: sig,
    previousConfiguration,
    provider,
  })
  if (!authenticated) {
    return new Response(JSON.stringify({}), { status: 401 })
  }

  try {
    console.log({ formData, data })
    // TODO: send email using sendgrid api.

    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
