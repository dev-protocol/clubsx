import { getDefaultClient } from '../redis'
import { verifyMessage } from 'ethers'
import { check } from './get-invitations-check'

type HandlerParams = {
  rpcUrl: string
  chainId: number
  property: string
}

export const handler =
  ({ rpcUrl, chainId, property }: HandlerParams) =>
  async ({ request }: { readonly request: Request }) => {
    const { signature, message, invitationId } = (await request.json()) as {
      signature: string
      message: string
      invitationId: string
    }

    // get the ethereum address from the signature
    // const signer = await getSigne(signature, message)
    const address = verifyMessage(message, signature)
    const client = await getDefaultClient()

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
            to,
            property,
            payload,
            gatewayAddress,
            amounts: {
              token,
              input,
              fee,
            },
          },
        }),
      },
    )

    return new Response(JSON.stringify({ id: invitationId }), { status: 200 })
  }

export default handler
