import {
  isNotError,
  whenDefined,
  whenDefinedAll,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import {
  generatePassportSkinKey,
  getDefaultClient,
} from '@fixtures/api/passport-skins/redis'
import {
  passportSkinDocument,
  type PassportSkinDocument,
} from '@fixtures/api/passport-skins/schema'
import { authenticate, decode, encode } from '@devprotocol/clubs-core'
import { getDefaultProvider } from 'ethers'
import type { createClient } from 'redis'
import { nanoid } from 'nanoid'

export type CreatePassportSkinReqBody = {
  site: string
  message: string
  signature: string
  passportSkin: Omit<PassportSkinDocument, 'id' | 'clubsUrl'>
}

const ERROR = {
  $400: {
    MISSINGDATA: 'Missing data.',
    INVALIDREQ: 'Invalid request.',
    CLUBSNOTFOUND: 'Clubs not found',
  },
  $401: {
    INVALIDACCESS: 'Invalid access.',
  },
  $500: {
    DBERROR: 'Passport skin creation error',
  },
}

export const setter = async ({
  client,
  data,
  url,
}: {
  client: ReturnType<typeof createClient>
  data: CreatePassportSkinReqBody
  url: string
}) => {
  // 1. Create passport skin document.
  const passportSkinDoc = passportSkinDocument({
    id: nanoid(),
    clubsUrl: url,
    ...data.passportSkin,
  })

  const passportSkinCreationStatus = await whenNotErrorAll(
    [passportSkinDoc, client],
    ([info, redis]) =>
      redis.json
        .set(generatePassportSkinKey(info.skinPayload), '$', info)
        .catch((err: Error) => err),
  )

  return passportSkinCreationStatus
}

export const POST = async ({ request }: { request: Request }) => {
  // 1. Get the data.
  const reqBody = await whenNotError(
    request,
    (r) =>
      whenDefined(r, (_r) =>
        _r
          .json()
          .then((res) => res as CreatePassportSkinReqBody)
          .catch((err: Error) => err),
      ) ?? new Error(ERROR.$400.INVALIDREQ),
  )

  const props = whenNotError(
    reqBody,
    (_r) =>
      whenDefinedAll(
        [_r.site, _r.message, _r.signature, _r.passportSkin],
        ([site, message, signature, passportSkin]) => ({
          site,
          message,
          signature,
          passportSkin,
        }),
      ) ?? new Error(ERROR.$400.MISSINGDATA),
  )

  // 2. Get client and validate client.
  const client = await whenNotError(props, (_) =>
    getDefaultClient().catch((err: Error) => err),
  )

  // 3. Authenticate for only admin's allowed to add achievements.
  const config = await whenNotErrorAll([props, client], ([p, c]) =>
    c
      .get(p.site)
      .then((res) => {
        if (res) {
          return res as string
        }

        throw new Error(ERROR.$400.CLUBSNOTFOUND)
      })
      .catch((err: Error) => err),
  )

  const authenticationRes = await whenNotErrorAll(
    [props, config],
    ([{ message, signature }, previousConfiguration]) =>
      authenticate({
        message,
        signature,
        previousConfiguration,
        provider: getDefaultProvider(decode(previousConfiguration).rpcUrl),
      }).catch((err: Error) => err),
  )
  const authenticated = whenNotError(authenticationRes, (r) =>
    r ? true : new Error(ERROR.$401.INVALIDACCESS),
  )

  const setterRes = await whenNotErrorAll(
    [authenticated, client, props, config],
    ([set, redis, data, config]) => {
      if (!set) {
        return new Error(ERROR.$500.DBERROR)
      }

      return setter({ client: redis, data, url: decode(config).url })
    },
  )

  await whenNotError(client, (redis) => redis.quit())

  return new Response(
    isNotError(setterRes)
      ? JSON.stringify({ created: true })
      : JSON.stringify({ created: false, error: setterRes.message }),
    {
      status: isNotError(setterRes)
        ? 200
        : Object.values(ERROR.$400).some((x) => x === setterRes.message)
          ? 400
          : Object.values(ERROR.$401).some((x) => x === setterRes.message)
            ? 401
            : 500,
    },
  )
}
