import { type ClubsPluginOption, decode } from '@devprotocol/clubs-core'
import {
  updateClubId,
  withCheckingIndex,
  getDefaultClient,
} from '@fixtures/api/club/redis'
import { instanceStore } from '@fixtures/firebase/instance'
import { hashMessage, recoverAddress } from 'ethers'
import { createClient } from 'redis'

export const POST = async ({ request }: { request: Request }) => {
  const { site, config, sig, hash } = (await request.json()) as {
    site: string
    config: string
    hash?: string
    sig?: string
  }

  // We need either signautre or firebase jwt token to authenticate the draft.
  const hashAndSignGiven = !!hash && !!sig
  const jwtIdTokenGiven = !!request.headers.has('authorization')
  if (!hashAndSignGiven && !jwtIdTokenGiven) {
    return new Response(JSON.stringify({ error: 'Auth failed' }), {
      status: 401,
    })
  }

  // Connect with the db.
  const client = await withCheckingIndex(getDefaultClient)

  client.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  // Fetch the previous config, whether in draft or not.
  const previousConfiguration = await client.get(site)
  if (!previousConfiguration) {
    return new Response(JSON.stringify({ error: 'Config not found' }), {
      status: 401,
    })
  }

  // Get the draft from the previous config.
  const decodedPreviousConfig = decode(previousConfiguration)
  const __draftOption: ClubsPluginOption | undefined =
    decodedPreviousConfig.options?.filter(
      (option) => option.key === '__draft',
    )[0]
  // The draft should be there, since we are setting config when signup occurs.
  if (!__draftOption || !__draftOption.value) {
    return new Response(JSON.stringify({ error: 'Draft not found' }), {
      status: 400,
    })
  }

  // Get the value of the __draftOptions.
  const value = __draftOption.value as {
    isInDraft: boolean
    address?: string
    uid?: string
  }

  // We also check whether the site is currently in drafting phase or not.
  // We should ideally set this to false, in the last stage of drafting once all
  // have been set and validated.
  if (!value.isInDraft) {
    return new Response(JSON.stringify({ error: 'Not in drafting phase' }), {
      status: 400,
    })
  }

  // We check that the signature matches the address in the draftOptions.
  if (hashAndSignGiven) {
    const address = recoverAddress(hashMessage(hash), sig)
    if (address.toLowerCase() !== value.address?.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Invalid sig' }), {
        status: 401,
      })
    }
  }

  // We now check that the jwt matches the user in the draftOptions.
  if (jwtIdTokenGiven) {
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
      if (uidInJwt !== value.uid) {
        return new Response(JSON.stringify({}), { status: 401 })
      }
    } catch (error: any) {
      return new Response(JSON.stringify({ error }), {
        status: error?.response?.status || 500,
      })
    }
  }

  try {
    await client.set(site, config)
    await updateClubId(
      { id: site, propertyAddress: decode(config).propertyAddress },
      client,
    )
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
