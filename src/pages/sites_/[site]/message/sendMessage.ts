import { utils, providers, ethers } from 'ethers'
import { createClient } from 'redis'
import { authenticate, decode } from '@devprotocol/clubs-core'
import { checkMemberships } from '@fixtures/utility'
import type { UndefinedOr } from '@devprotocol/util-ts'
import type { GatedMessage } from '@plugins/message/types'
import type { Membership } from '@plugins/memberships'
import sgMail from '@sendgrid/mail'
import { verify } from 'jsonwebtoken-esm'

export const post = async ({ request }: { request: Request }) => {
  const {
    pluginIndex,
    membershipPluginIndex,
    site,
    formId,
    data,
    sig,
    hash,
    userAddress,
    propertyAddress,
  } = (await request.json()) as {
    pluginIndex?: number
    membershipPluginIndex?: number
    site: string
    formId: string
    data: any
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
  )?.find((element) => element.id === formId)
  if (!formData) {
    return new Response(JSON.stringify({ error: 'Form details not found' }), {
      status: 401,
    })
  }

  let decodedEmail = verify(formData.destinationEmail, process.env.SALT ?? '')

  const membershipsData = configuration.plugins?.[
    membershipPluginIndex ?? 0
  ]?.options?.find((element) => element.key === 'memberships')
    ?.value as UndefinedOr<Membership[]>
  if (!membershipsData) {
    return new Response(JSON.stringify({ error: 'Memberships not found' }), {
      status: 401,
    })
  }

  const requiredMemberships = formData.requiredMembershipIds.map((id) =>
    membershipsData.find((mem) => mem.id === id)
  )

  // Check for required membership validity
  try {
    const web3Provider = new ethers.providers.JsonRpcProvider(
      decode(previousConfiguration).rpcUrl
    )
    const isMember = await checkMemberships(
      web3Provider,
      propertyAddress,
      // @ts-ignore
      requiredMemberships,
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
    sgMail.setApiKey(process.env[formData.sendGridEnvKey]!)

    await sgMail.send({
      to: `${decodedEmail}`,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: 'Sent from Clubs Gated Contact Form',
      text:
        formData.presetName === 'PRESET_NAME_AND_FREE_INPUT'
          ? `
Name: ${data.name}

Message:
${data.body}
`
          : data,
    })

    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
