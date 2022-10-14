import { utils, providers } from 'ethers'
import { createClient } from 'redis'
import { authenticate } from '@devprotocol/clubs-core'

import json from '../../../../plugins/message/forms.json'

export const post = async ({ request }: { request: Request }) => {
  const { site, data, sig, hash, userAddress } = (await request.json()) as {
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
  }

  // Check that the user has signed the message.
  const verificationDigest = utils.hashMessage(hash);
  const recoveredSigner = utils.recoverAddress(verificationDigest, sig);
  if (recoveredSigner.toLowerCase() !== userAddress.toLowerCase()) {
    return new Response(JSON.stringify({ error: 'Invalid signer' }), {
      status: 404,
    })
  }

  const formData = json.find((element) => element.id === Number(data.formId))
  if (!formData) {
    return new Response(JSON.stringify({ error: 'Form details not found' }), {
      status: 401,
    })
  }

  const provider = providers.getDefaultProvider(
    import.meta.env.PUBLIC_WEB3_PROVIDER_URL
  )

  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
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
    // TODO: send email using sendgrid api.

    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
