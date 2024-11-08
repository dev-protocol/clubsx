import { headers } from '@fixtures/api/headers'
import { json, type JSON } from '@fixtures/api/json'
import type { APIRoute } from 'astro'
import { getDefaultClient, Index } from '@fixtures/api/assets/redis'
import { CLUB_SCHEMA } from '@fixtures/api/club/schema'
import { Index as ClubIndex } from '@fixtures/api/club/redis'
import {
  isNotError,
  whenDefined,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'

import {
  generateKey,
  AchievementPrefix,
  AchievementIndex,
} from '@plugins/achievements/utils'
import { ACHIEVEMENT_DIST_SCHEMA } from '@plugins/achievements/db/schema'
import { claimableOrNot } from '@plugins/achievements/utils'
import { type AchievementDist } from '@plugins/achievements/types'

export const GET: APIRoute = async (req) => {
  const eoa =
    whenDefined(req.params.eoa, (addr) => addr) ?? new Error('No EOA passed')

  const client = await getDefaultClient()

  const allAchievementToEOA: AchievementDist[] = await whenNotError(
    eoa,
    (addr) =>
      client.ft
        .search(
          AchievementIndex.AchievementDist,
          `@${ACHIEVEMENT_DIST_SCHEMA['$.conditions.recipients'].AS}:${addr}`,
          {
            SORTBY: {
              BY: ACHIEVEMENT_DIST_SCHEMA['$.createdOnTimestamp'].AS,
              DIRECTION: 'DESC',
            },
          },
        )
        .then((res) => {
          return JSON.parse(
            JSON.stringify(res.documents.map(({ value }) => value)),
          )
        })
        .catch((err: Error) => err),
  )

  const searchClubsURLFromHash = async (ClubsURLHash: string) => {
    const search = await client.ft
      .search(
        ClubIndex.Club,
        `@${CLUB_SCHEMA['$.clubsUrlHash'].AS}:{${ClubsURLHash}}`,
        {
          LIMIT: { from: 0, size: 1 },
          RETURN: ['clubsUrl'],
        },
      )
      .then((res) => {
        return JSON.parse(
          JSON.stringify(res.documents.map(({ value }) => value)),
        )
      })
    return search[0].clubsUrl
  }

  const claimableAchievement = async (achievement: AchievementDist) => {
    const { result, distDocument, claimed } = await claimableOrNot(
      achievement.id,
      eoa.toString(),
      client,
    )
    const clubsUrl = await searchClubsURLFromHash(achievement.clubsUrl)
    if (result && !claimed && distDocument?.id === achievement.id) {
      return clubsUrl + '/achievement/' + achievement.id
    } else {
      return undefined
    }
  }

  const claimableAchievements = (
    await Promise.all(
      allAchievementToEOA.map(async (achievement) => {
        return await claimableAchievement(achievement)
      }),
    )
  ).filter((achievement) => achievement !== undefined)

  await client.quit()

  const res = whenNotError(claimableAchievements, (claimableAchievements) => ({
    achievementUrl: claimableAchievements.slice(0, 5),
  }))

  return new Response(
    isNotError(res)
      ? json(res as JSON)
      : json({ achievementUrl: [], error: res.message }),
    {
      status: isNotError(res) ? 200 : 400,
      headers,
    },
  )
}
