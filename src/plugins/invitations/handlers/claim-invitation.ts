import { getDefaultClient } from '../redis'
import { verifyMessage } from 'ethers'
import { check } from './get-invitations-check'
import type {
  ClubsFunctionGetPluginConfigById,
  Membership,
} from '@devprotocol/clubs-core'
import {
  whenNotErrorAll,
  type UndefinedOr,
  whenNotError,
} from '@devprotocol/util-ts'
import {
  Index,
  schemaInvitation,
  uuidToQuery,
  type Invitation,
} from '../redis-schema'

type HandlerParams = {
  rpcUrl: string
  chainId: number
  property: string
  getPluginConfigById: ClubsFunctionGetPluginConfigById
}

export const handler =
  ({ rpcUrl, chainId, property, getPluginConfigById }: HandlerParams) =>
  async ({ request }: { readonly request: Request }) => {
    const { signature, message, invitationId } = (await request.json()) as {
      signature: string
      message: string
      invitationId: string
    }

    const client = await getDefaultClient()

    // Try to fetch the mapped invitation.
    const data = await whenNotErrorAll(
      [invitationId, client],
      ([_id, _client]) =>
        _client.ft.search(
          Index.Invitation,
          `@${schemaInvitation['$.id'].AS}:{${uuidToQuery(_id)}}`,
          {
            LIMIT: {
              from: 0,
              size: 1,
            },
          },
        ),
    )

    const invitation = whenNotError(
      data,
      (d) =>
        (d.documents.find((x) => x.value)?.value as UndefinedOr<Invitation>) ??
        new Error('ID is not found.'),
    )

    if (invitation instanceof Error) {
      return new Response(JSON.stringify({ error: 'ID is not found' }), {
        status: 400,
      })
    }

    const membershipsPlugin = getPluginConfigById(
      'devprotocol:clubs:simple-memberships',
    )

    if (!membershipsPlugin || !membershipsPlugin[0]?.options) {
      return new Response(
        JSON.stringify({ error: 'Simple memberships plugin not found' }),
        {
          status: 500,
        },
      )
    }

    const memberships =
      (membershipsPlugin[0]?.options?.find(({ key }) => key === 'memberships')
        ?.value as UndefinedOr<Membership[]>) ?? []

    const invitationMembership = memberships.find(
      (m) => m.payload === invitation.membership.payload,
    )

    // get the ethereum address from the signature
    // const signer = await getSigne(signature, message)
    const address = verifyMessage(message, signature)

    const available = await check({
      id: invitationId,
      account: address,
      client,
    })

    if (!available) {
      return new Response(
        JSON.stringify({ error: 'Invitation not available' }),
        {
          status: 401,
        },
      )
    }

    const sendDevProtocolApiKey = process.env.SEND_DEVPROTOCOL_API_KEY ?? ''

    const res = fetch(
      'https://send.devprotocol.xyz/api/send-transactions/SwapTokensAndStakeDev',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendDevProtocolApiKey}`,
        },
        body: JSON.stringify({
          requestId: invitationId,
          rpcUrl,
          chainId,
          args: {
            to: address,
            property,
            payload: invitationMembership?.payload,
            gatewayAddress: invitation.conditions?.recipient,
            amounts: {
              token: invitationMembership?.currency,
              input: invitationMembership?.price,
              fee: invitationMembership?.fee,
            },
          },
        }),
      },
    )

    return new Response(JSON.stringify({ id: invitationId }), { status: 200 })
  }

export default handler
