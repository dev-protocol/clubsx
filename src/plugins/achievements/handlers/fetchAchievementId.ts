import type { APIRoute } from 'astro'

import {
  isNotError,
  whenDefined,
  whenDefinedAll,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'

import { getDefaultClient, withCheckingIndex } from '../db/redis'
import { type AchievementDist, type AchievementInfo } from '../types'
import {
  AchievementPrefix,
  getIdFromURL,
  claimableOrNot,
  generateKey,
} from '../utils'
import { ZeroAddress } from 'ethers'

const ERROR = {
  $400: {
    MISSINGDATA: 'Missing data.',
    MISSINGDISTID: 'Achievement ID is not found.',
    MISSINGINFOID: 'Achievement metadata is not found.',
  },
  $500: {},
}

export type FetchAchievementResult = AchievementInfo &
  AchievementDist & {
    claimable: boolean
    claimed: boolean
    achievementId: string
    achievementInfoId: string
  }

export const handler =
  (clubsUrl: string): APIRoute =>
  async ({ url }) => {
    // 1. Get achievement id.
    const base =
      whenDefinedAll(
        [getIdFromURL(url), url, clubsUrl],
        ([achievementId, _url, _clubsUrl]) => ({
          achievementId,
          url,
          clubsUrl,
        }),
      ) ?? new Error(ERROR.$400.MISSINGDATA)

    const account = url.searchParams.get('account')

    // 2. Generate a redis client.
    const client = await withCheckingIndex(getDefaultClient).catch(
      (err: Error) => err,
    )

    // 3. Try to fetch the mapped achievement and check if the user is claimable.
    const claimable = await whenNotErrorAll(
      [base, client],
      ([{ achievementId }, redis]) =>
        claimableOrNot(achievementId, account ?? ZeroAddress, redis),
    )
    const achievementDist = whenNotError(
      claimable,
      (_claimable) =>
        whenDefined(_claimable.distDocument, (distDocument) => distDocument) ??
        new Error(ERROR.$400.MISSINGDISTID),
    )
    const achievementInfoDocument = await whenNotErrorAll(
      [achievementDist, client],
      ([dist, _client]) =>
        _client.json
          .get(
            generateKey(
              AchievementPrefix.AchievementInfo,
              dist.achievementInfoId,
            ),
          )
          .catch((err: Error) => err),
    )
    const achievementInfo = whenNotError(
      achievementInfoDocument,
      (d) =>
        (d as UndefinedOr<AchievementInfo>) ??
        new Error(ERROR.$400.MISSINGINFOID),
    )

    await whenNotError(client, (redis) => redis.quit())

    const res = whenNotErrorAll(
      [achievementInfo, achievementDist, claimable],
      ([info, dist, _claimable]) => ({
        info,
        dist,
        claimable: _claimable,
      }),
    )

    return new Response(
      isNotError(res)
        ? JSON.stringify({
            ...res.info,
            ...res.dist,
            achievementId: res.dist.id,
            achievementInfoId: res.info.id,
            claimable: res.claimable.result,
            claimed: res.claimable.claimed,
          } satisfies FetchAchievementResult)
        : JSON.stringify({ error: res.message }),
      {
        status: isNotError(res)
          ? 200
          : Object.values(ERROR.$400).some((x) => x === res.message)
            ? 400
            : 500,
      },
    )
  }

export default handler
