import fetch from 'cross-fetch'
import dotenv from 'dotenv'
import options from './options.mjs'

dotenv.config()

const run = async () => {
  const result = await Promise.all(
    options.map(({ requestId, rpcUrl, chainId, args }) =>
      fetch(
        'https://send.devprotocol.xyz/api/send-transactions/SwapTokensAndStakeDev',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.SEND_DEVPROTOCOL_API_KEY}`,
          },
          body: JSON.stringify({ requestId, rpcUrl, chainId, args }),
        },
      ).catch((err) => new Error(err)),
    ),
  )

  console.log({ result })
}

run()
