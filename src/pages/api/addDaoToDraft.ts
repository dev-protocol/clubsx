import { whenDefined } from '@devprotocol/util-ts'
import { generateId } from '@fixtures/api/keys'
import { instanceStore } from '@fixtures/firebase/instance'
import { hashMessage, recoverAddress } from 'ethers'
import { createClient } from 'redis'

import type { ClubsData } from './fetchClubs'
import { hasCreationLimitReached } from './hasCreationLimitReached/util'
import {
  updateClubId,
  withCheckingIndex,
  getDefaultClient,
} from '@fixtures/api/club/redis'
import { decode } from '@devprotocol/clubs-core'

export const POST = async ({ request }: { request: Request }) => {
  const { site, config, sig, hash, expectedAddress, uid } =
    (await request.json()) as {
      site: string
      config: string
      hash?: string
      sig?: string
      uid?: string
      expectedAddress?: string
    }

  // We need either signautre or firebase jwt token to authenticate the draft.
  const hashAndSignGiven = !!hash && !!sig && !!expectedAddress
  const uidAndTokenGiven = !!uid && !!request.headers.has('authorization')
  if (!hashAndSignGiven && !uidAndTokenGiven) {
    return new Response(JSON.stringify({ error: 'Auth failed' }), {
      status: 401,
    })
  }

  const client = await withCheckingIndex(getDefaultClient)

  client.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  // Unlike updateConfig, where previousConfiguration has to be there,
  // here previousConfiguration should not be there.
  const previousConfiguration = await client.get(site)
  if (previousConfiguration) {
    return new Response(JSON.stringify({ error: 'Config already found' }), {
      status: 401,
    })
  }

  // Check that user has no more than 3 clubs at the moment to avoid domain parking.
  try {
    const identifier: string | undefined = uid ?? expectedAddress
    if (!identifier) {
      return new Response(
        JSON.stringify({ error: 'No user identifier passed' }),
        {
          status: 401,
        },
      )
    }

    if (await hasCreationLimitReached(identifier)) {
      return new Response(
        JSON.stringify({ message: 'You already have created 3 clubs' }),
        {
          status: 400,
        },
      )
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error }), {
      status: error?.response?.status || 500,
    })
  }

  // If we are passing auth header and uid, then we are using email(firebase uid) to signup and draft.
  if (uidAndTokenGiven) {
    // We get the authorization header.
    const authorization: string | null = request.headers.get('authorization')

    // Get the token out of the header.
    const jwtTokenId: string | undefined = authorization?.split('Bearer ')[1]
    if (!jwtTokenId) {
      return new Response(JSON.stringify({ error: 'Auth missing' }), {
        status: 401,
      })
    }

    // Initialize the firebase app and check that token is valid.
    const auth = instanceStore.initializedAdminApp
    // Then we compare the token.
    try {
      const decodedJwtData = await auth.verifyIdToken(jwtTokenId)
      const uidInJwt = decodedJwtData.uid
      if (uidInJwt !== uid) {
        return new Response(JSON.stringify({}), { status: 401 })
      }
    } catch (error: any) {
      return new Response(JSON.stringify({ error }), {
        status: error?.response?.status || 500,
      })
    }
  }

  if (hashAndSignGiven) {
    // Else we are using wallet signature to do the same.
    const address = recoverAddress(hashMessage(hash), sig)
    if (address.toLowerCase() != expectedAddress.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Invalid address' }), {
        status: 401,
      })
    }
  }

  try {
    await client.set(site, config)
    await updateClubId(
      {
        id: site,
        propertyAddress: decode(config).propertyAddress,
        created_at: Date.now(),
        owner: {
          address: expectedAddress,
          firebaseUid: uid,
        },
      },
      client,
    )
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
