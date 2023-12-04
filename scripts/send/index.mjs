import fetch from 'cross-fetch'
import PQueue from 'p-queue'
import dotenv from 'dotenv'
import options from './options.mjs'

dotenv.config()

const queue = new PQueue({ concurrency: 1, interval: 10 * 1000 })

const run = async () => {
  const result = await queue.addAll(
    options.map(
      ({ requestId, rpcUrl, chainId, args }) =>
        () =>
          fetch(
            'https://send.devprotocol.xyz/api/send-transactions/SwapTokensAndStakeDev',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.SEND_DEVPROTOCOL_API_KEY}`,
              },
              body: JSON.stringify({ requestId, rpcUrl, chainId, args }),
            },
          )
            .then((res) => {
              console.log({ res, args })
              return res
            })
            .catch((err) => new Error(err)),
    ),
  )

  console.log({ result })
}

run()
