import { headers } from '@fixtures/api/headers'
import { json, type JSON } from '@fixtures/api/json'
import type { APIRoute } from 'astro'
import { getDefaultClient, Index } from '@fixtures/api/assets/redis'
import { isNotError, whenDefined, whenNotError, whenNotErrorAll } from '@devprotocol/util-ts'

import { generateKey, AchievementPrefix, AchievementIndex}  from '@plugins/achievements/utils'
import { ACHIEVEMENT_DIST_SCHEMA } from '@plugins/achievements/db/schema'
import { type AchievementDist } from '@plugins/achievements/types'


export const GET: APIRoute = async (req) => {
    const eoa =
        whenDefined(req.params.eoa, (addr) => addr) ??
        new Error('No EOA passed')

    const client = await getDefaultClient()
    // const achievements = whenNotErrorAll(
    //     [eoa, client],
    //     async ([recipient, redis]) => {
    //         await redis.json.get(
    //             generateKey(AchievementPrefix.AchievementDist, '*'), // Use wildcard for all achievement keys
    //           ).then((res) => {
    //             console.log({res})
    //             return res
    //           })
    //     }
    // )

    console.log(generateKey(AchievementPrefix.AchievementDist, 'cVpk5LEvB4'))

    const achievements = await client.json.get(
        generateKey(AchievementPrefix.AchievementDist, '*')
        , // Use wildcard for all achievement keys
      ).then((res) => {
        console.log({res})
        return res
      })

      console.log("OG", `@${ACHIEVEMENT_DIST_SCHEMA['$.conditions.recipients'].AS}:${eoa}`)
      console.log("GPT", `@conditionsRecipients:${eoa}`)


      const test = await whenNotError(eoa, (addr) =>
        client.ft
          .search(
            AchievementIndex.AchievementDist,
            `@${ACHIEVEMENT_DIST_SCHEMA['$.conditions.recipients'].AS}:${addr}`,
            {
                RETURN: ['id', 'achievementInfoId', 'conditionsRecipients', 'createdOnTimestamp', 'clubsUrl'],
                SORTBY: { BY: ACHIEVEMENT_DIST_SCHEMA['$.createdOnTimestamp'].AS, DIRECTION: 'DESC' },
            },
            
          ).then((res) => {
            return res.documents.map(({ value }) => value)
          })
          .catch((err: Error) => err),
      )
    let test1;
    if (Array.isArray(test)) {
        test1 = test[0];
    } else {
        console.error(test);
    }
    console.log({test1})
    console.log("Clubs URL", JSON.parse(JSON.stringify(test1)))
    console.log({test})
    
    await client.quit()

    console.log({achievements})

    return new Response(
        isNotError(eoa)
            ? json({ eoa: eoa })
            : json({ eoa: 'No EOA passed' }),
        {
            status: isNotError(eoa) ? 200 : 400,
            headers,
        },
    )
}