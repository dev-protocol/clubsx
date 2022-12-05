import { setOptions } from '@devprotocol/clubs-core'
import { utils } from 'ethers'

export const post = async ({ request }: { request: Request }) => {
  const { signature, message } = (await request.json()) as {
    message: string
    signature: string
  }

  const digest = utils.hashMessage(message)
  const address = utils.recoverAddress(digest, signature)

  // is this correct?
  setOptions(
    [
      {
        key: '__draft',
        value: {
          user: {
            mail: address,
          },
        },
      },
    ],
    0 // currentPluginIndex
  )

  return new Response(JSON.stringify({}), { status: 200 })
}
