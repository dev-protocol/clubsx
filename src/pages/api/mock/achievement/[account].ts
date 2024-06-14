import { isAddress } from 'ethers'
import type { APIRoute, Params } from 'astro'
import { whenDefined, whenNotError } from '@devprotocol/util-ts'

import { json } from '@fixtures/api/json'
import { headers } from '@fixtures/api/headers'

export const POST: APIRoute = async ({ params }: { params: Params }) => {
  // 1. Fetch the param and validate that it's an address.
  const isParamValid = whenNotError(
    params,
    (_params) =>
      whenDefined(_params, (_p) =>
        isAddress(_p.account) ? true : new Error('Bad request data'),
      ) ?? new Error('Bad request data'),
  )

  // 2. Validate that param is not error and it's valid.
  if (isParamValid instanceof Error || !isParamValid) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 500,
    })
  }

  // 3. Figure out the achievements endpoint and it's data.
  const achievementsEndpoint =
    'https://developers.clubs.place/api/devprotocol:clubs:plugin:achievements/achievements'
  const { MOCK_ACHIEVEMENTS_API_MESSAGE, MOCK_ACHIEVEMENTS_ADMIN_SIGNATURE } =
    import.meta.env ||
    process.env ||
    ({
      MOCK_ACHIEVEMENTS_API_MESSAGE: '',
      MOCK_ACHIEVEMENTS_ADMIN_SIGNATURE: '',
    } as {
      MOCK_ACHIEVEMENTS_API_MESSAGE: string
      MOCK_ACHIEVEMENTS_ADMIN_SIGNATURE: string
    })
  const achievementsStringifiedData = JSON.stringify({
    message: MOCK_ACHIEVEMENTS_API_MESSAGE,
    signature: MOCK_ACHIEVEMENTS_ADMIN_SIGNATURE,
    noOfCopies: 1,
    achievement: {
      contract: '0x72a6829957Ec7ebD62c174df26f06C000b8d94Ac',
      metadata: {
        name: 'Clubber',
        description: 'Having this badge is sure to turn you into a Clubber!',
        image:
          'https://gateway.pinata.cloud/ipfs/QmSEEHoa4vC6We7oYYMEZyEHg55k9LiguUro4bhPsio2DW',
        numberAttributes: [],
        stringAttributes: [],
      },
      account: params.account,
    },
  })

  // 4. Send the req. to add the achievement.
  const addAchievementsResponse = await fetch(achievementsEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: achievementsStringifiedData,
  })
    .then(
      (res) => {
        if (res.ok) {
          return res
        }
        throw Error('Error ' + res.status + ': ' + res.statusText)
      },
      (err) => {
        throw new Error(err.message)
      },
    )
    .then(
      (res) => res.json(),
      (err) => {
        throw new Error(err.message)
      },
    )
    .then(
      (res) => res as { ids: number[] },
      (err) => {
        throw new Error(err.message)
      },
    )
    .catch((err) => {
      return err
    })

  if (
    addAchievementsResponse instanceof Error ||
    !addAchievementsResponse ||
    !addAchievementsResponse.ids ||
    !addAchievementsResponse.ids.length
  ) {
    return new Response(
      JSON.stringify({ error: 'Adding achievements failed' }),
      {
        status: 500,
      },
    )
  }

  return new Response(json({ id: addAchievementsResponse.ids[0] }), {
    status: 200,
    headers,
  })
}
