import { getDefaultClient } from '../redis'
import {
  parseUnits,
  verifyMessage,
  MaxUint256,
  ZeroAddress,
  JsonRpcProvider,
  type TransactionResponse,
} from 'ethers'
import { check } from './get-invitations-check'
import {
  bytes32Hex,
  getTokenAddress,
  membershipToStruct,
  type ClubsFunctionGetPluginConfigById,
  type Membership,
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
  Prefix,
  historyDocument,
} from '../redis-schema'
import BigNumber from 'bignumber.js'

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
      (m) =>
        bytes32Hex(m.payload) === bytes32Hex(invitation.membership.payload),
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

    const isUnpriced = invitationMembership?.price === undefined
    const parsedPrice = isUnpriced
      ? MaxUint256
      : invitationMembership?.currency === 'USDC'
        ? parseUnits(invitationMembership?.price.toString(), 6)
        : parseUnits(invitationMembership?.price.toString(), 18)

    const fee = isUnpriced
      ? MaxUint256.toString()
      : new BigNumber(parsedPrice.toString())
          .times(invitationMembership?.fee?.percentage ?? 0)
          .dp(0, 1)
          .toFixed()

    if (!invitationMembership) {
      return new Response(JSON.stringify({ error: 'Membership not found' }), {
        status: 404,
      })
    }

    const { gateway, token, requiredTokenAmount, requiredTokenFee } =
      membershipToStruct(invitationMembership, chainId)

    const args: {
      to: string
      property: string
      payload: string
      gatewayAddress: string
      amounts: {
        token: string
        input: bigint
        fee: bigint
      }
    } = {
      to: address,
      property,
      payload: bytes32Hex(invitationMembership?.payload ?? []),
      gatewayAddress: gateway,
      amounts: {
        token,
        input: requiredTokenAmount,
        fee: requiredTokenFee,
      },
    }
    console.log(request.url, { args })
    const res = await fetch(
      'https://send.devprotocol.xyz/api/send-transactions/SwapTokensAndStakeDev',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendDevProtocolApiKey}`,
        },
        body: JSON.stringify({
          requestId: `${invitationId}:${address}`,
          rpcUrl,
          chainId,
          args,
        }),
      },
    )

    const resJson = res.ok
      ? ((await res.json()) as { transaction: TransactionResponse })
      : new Error('Failed to call send.devprotocol.xyz')
    console.log('resJson:', resJson)

    const transaction = whenNotError(resJson, (data) => data.transaction)

    await whenNotError(transaction, async (tx) => {
      await new JsonRpcProvider(rpcUrl).waitForTransaction(tx.hash)
      console.log(`Transaction ${tx.hash} is mined.`)
    })

    const history = historyDocument({
      usedId: invitation.id,
      datetime: Date.now(),
      account: address,
    })

    await client.json.set(`${Prefix.History}::${history.id}`, '$', history)
    await client.quit()

    return new Response(JSON.stringify({ id: invitationId }), { status: 200 })
  }

export default handler
