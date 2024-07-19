import { getDefaultProvider } from 'ethers'

import {
  authenticate,
  type ClubsConfiguration,
  encode,
} from '@devprotocol/clubs-core'

import { getDefaultClient, withCheckingIndex } from '../db/redis'
import type { Achievement, AchievementDist } from '../types'
import {
  AchievementPrefix,
  getAchievementInfoDocument,
  clubsUrlToKeccak256Tag,
  createAchievementDistId,
  generateKey,
} from '../utils'
import {
  isNotError,
  whenDefinedAll,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'

const ERROR = {
  $400: {
    MISSINGDATA: 'Missing data.',
  },
  $401: {
    INVALIDACCESS: 'Invalid access.',
  },
  $500: {
    DBERROR: 'ID creation error',
  },
}

export const handler =
  (conf: ClubsConfiguration) =>
  async ({ request }: { request: Request }) => {
    // 1. Get the data.
    const reqBody = (await request.json().catch((err: Error) => err)) as {
      message: string
      signature: string
      noOfCopies?: number
      achievement: Omit<Achievement, 'id' | 'clubsUrl' | 'achievementInfoId'>
    }
    const props =
      whenDefinedAll(
        [
          reqBody.message,
          reqBody.signature,
          reqBody.noOfCopies ?? 1,
          reqBody.achievement,
        ],
        ([message, signature, noOfCopies, achievement]) => ({
          message,
          signature,
          noOfCopies,
          achievement,
        }),
      ) ?? new Error(ERROR.$400.MISSINGDATA)

    // 3. Get client and validate client.
    const client = await withCheckingIndex(getDefaultClient).catch(
      (err: Error) => err,
    )

    // 4. Authenticate for only admin's allowed to add achievements.
    const previousConfiguration = encode(conf)
    const authenticationRes = await whenNotError(
      props,
      ({ message, signature }) =>
        authenticate({
          message,
          signature,
          previousConfiguration,
          provider: getDefaultProvider(conf.rpcUrl),
        }).catch((err: Error) => err),
    )
    const authenticated = whenNotError(authenticationRes, (r) =>
      r ? true : new Error(ERROR.$401.INVALIDACCESS),
    )

    // 6. Create achievement document.
    const achievementInfoDocument = whenNotError(props, ({ achievement }) =>
      getAchievementInfoDocument({
        contract: achievement.contract,
        metadata: {
          ...achievement.metadata,
        },
      }),
    )

    // 7. Check if achivement info is already present
    const recAchievementInfo = await whenNotErrorAll(
      [authenticated, achievementInfoDocument, client],
      ([_, info, redis]) =>
        redis.json
          .set(
            generateKey(AchievementPrefix.AchievementInfo, info.id),
            '$',
            info,
          )
          .catch((err: Error) => err),
    )

    // 8. Create a list of all the achievement ids to be created (since no. of achievements >= 1)
    let achievementDistIds: (string | Error)[] = []
    const noOfCopies = isNotError(props) ? props.noOfCopies : 0
    for (let i = 0; i < noOfCopies; i++) {
      // 8.a. Get the id of newly created achievement dist.
      const achievementId = await whenNotError(client, (redis) =>
        createAchievementDistId(redis),
      )
      // 8.c Save the achivements ids to save in db and return them as response.
      achievementDistIds.push(achievementId)
    }
    const distIds = achievementDistIds.every(isNotError)
      ? achievementDistIds
      : new Error(ERROR.$500.DBERROR)

    // 9. Seth the record and update timestamp of record.
    const res = await whenNotErrorAll(
      [
        authenticated,
        recAchievementInfo,
        distIds,
        client,
        props,
        achievementInfoDocument,
      ],
      ([_, __, ids, redis, { achievement }, info]) =>
        Promise.all(
          ids.map((achievementId: string) =>
            redis.json.set(
              generateKey(AchievementPrefix.AchievementDist, achievementId),
              '$',
              {
                id: achievementId,
                achievementInfoId: info.id,
                conditions: achievement.conditions,
                createdOnTimestamp: Date.now(),
                clubsUrl: clubsUrlToKeccak256Tag(conf.url),
              } satisfies AchievementDist,
            ),
          ),
        ),
    )

    await whenNotError(client, (redis) => redis.quit())

    return new Response(
      isNotError(res)
        ? JSON.stringify({ ids: distIds })
        : JSON.stringify({ error: res.message }),
      {
        status: isNotError(res)
          ? 200
          : Object.values(ERROR.$400).some((x) => x === res.message)
            ? 400
            : Object.values(ERROR.$401).some((x) => x === res.message)
              ? 401
              : 500,
      },
    )
  }

export default handler
