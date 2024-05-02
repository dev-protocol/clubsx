import { verifyMessage } from 'ethers'

import {
  whenNotErrorAll,
  type UndefinedOr,
  whenNotError,
} from '@devprotocol/util-ts'

import { getDefaultClient } from '../db/redis'
import { ACHIEVEMENT_ITEM_SCHEMA } from '../db/schema'
import {
  type Achievement,
  type AchievementInfo,
  type ClaimAchievementApiHandlerParams,
  type StringAttribute,
} from '../types'
import {
  AchievementIndex,
  AchievementPrefix,
  checkForExistingAchievementInfo,
  checkForExistingAchievementItem,
  uuidToQuery,
  clubsUrlToKeccak256Tag,
} from '../utils'

export const handler =
  ({ rpcUrl, chainId, property, url }: ClaimAchievementApiHandlerParams) =>
  async ({ request }: { readonly request: Request }) => {
    // 1. Get the req data.
    const { message, signature, achievementItemId } =
      (await request.json()) as {
        message: string
        signature: string
        achievementItemId: string
      }
    // 2. Validated presence of req data.
    if (!achievementItemId || !message || !signature || !url) {
      return new Response(JSON.stringify({ error: 'Bad data' }), {
        status: 400,
      })
    }
    if (!(await checkForExistingAchievementItem(achievementItemId))) {
      return new Response(JSON.stringify({ error: 'Bad achievement data' }), {
        status: 400,
      })
    }

    // 3. Get client and validate it.
    const client = await getDefaultClient()
    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 500,
      })
    }

    // 4. Fetch the mapped achievement documents.
    const achievementitemData = await whenNotErrorAll(
      [achievementItemId, client],
      ([_id, _client]) =>
        _client.ft.search(
          AchievementIndex.AchievementItem,
          `@${ACHIEVEMENT_ITEM_SCHEMA['$.id'].AS}:{${uuidToQuery(_id)}} @${ACHIEVEMENT_ITEM_SCHEMA['$.clubsUrl'].AS}:{${clubsUrlToKeccak256Tag(url)}}`,
          {
            LIMIT: {
              from: 0,
              size: 1,
            },
          },
        ),
    )
    // 5. Fetch achievement from mapped documents.
    const achievementItem = whenNotError(
      achievementitemData,
      (d) =>
        (d.documents.find((x) => x.value)?.value as UndefinedOr<Achievement>) ??
        new Error('ID is not found.'),
    )
    // 6. Validate achievement is fetched properly.
    if (achievementItem instanceof Error || !achievementItem) {
      return new Response(
        JSON.stringify({ error: 'Achievement is not found' }),
        {
          status: 400,
        },
      )
    }
    // 7. Validated achievement ids are matched and that achievement info also exists
    if (
      achievementItemId !== achievementItem.id ||
      !(await checkForExistingAchievementInfo(
        achievementItem.achievementInfoId,
      ))
    ) {
      return new Response(JSON.stringify({ error: 'Bad data sent to api' }), {
        status: 400,
      })
    }
    // 8. Validate if achievement is already claimed.
    if (achievementItem.claimed) {
      return new Response(
        JSON.stringify({ error: 'Achievement already claimed' }),
        {
          status: 400,
        },
      )
    }

    // 9. Get the msg.sender / claimer addr.
    const account = verifyMessage(message, signature)
    // 10. Valdiate that claimer address is same as the one who is rewarded with achievement.
    if (account !== achievementItem.account) {
      return new Response(
        JSON.stringify({ error: 'Sender not achievement receiver' }),
        {
          status: 400,
        },
      )
    }

    // 11. Fetch achievement info document.
    const achievementInfoDocument = await whenNotErrorAll(
      [achievementItem, client],
      ([_achievementItem, _client]) =>
        _client.json.get(
          `${AchievementPrefix.AchievementInfo}::${_achievementItem.achievementInfoId}`,
        ),
    )
    const achievementInfo = whenNotError(
      achievementInfoDocument,
      (d) =>
        (d as UndefinedOr<AchievementInfo>) ?? new Error('ID is not found.'),
    )
    if (achievementInfo instanceof Error || !achievementInfo) {
      return new Response(
        JSON.stringify({ error: 'Achievement is not found' }),
        {
          status: 400,
        },
      )
    }

    // Add `Property: PROPERTY_VALUE` to the metadata
    const metadata = ((propertyKey) => {
      const { stringAttributes } = achievementInfo.metadata
      const nextStringAttributes: StringAttribute[] = [
        ...stringAttributes.filter(
          ({ trait_type }) => trait_type !== propertyKey,
        ),
        { trait_type: propertyKey, value: property },
      ]
      return {
        ...achievementInfo.metadata,
        stringAttributes: nextStringAttributes,
      }
    })('Property')

    // 12. Call the mint api (send.devprotocol.xyz)
    const { SEND_DEV_PROTOCOL_API_KEY } =
      import.meta.env ||
      process.env ||
      ({ SEND_DEV_PROTOCOL_API_KEY: '' } as {
        SEND_DEV_PROTOCOL_API_KEY: string
      })
    const mintApiResponse = await fetch(
      `https://send.devprotocol.xyz/api/send-transactions/AchievementsSBT/${achievementInfo.contract}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SEND_DEV_PROTOCOL_API_KEY}`,
        },
        body: JSON.stringify({
          requestId: `${achievementItem.id}${account}`, // achievementItem.id + user signing EOA
          rpcUrl,
          chainId,
          metadata,
          to: achievementItem.account,
        }),
      },
    )
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
        (res) => res as { message: string; claimedSBTTokenId: number },
        (err) => {
          throw new Error(err.message)
        },
      )
      .catch((err) => {
        return err
      })
    if (
      mintApiResponse instanceof Error ||
      !mintApiResponse ||
      !mintApiResponse.claimedSBTTokenId
    ) {
      return new Response(JSON.stringify({ error: 'Mint api failed' }), {
        status: 500,
      })
    }

    // 9. Update the record to mark the achievement as claimed.
    const claimedSBTTokenId = mintApiResponse.claimedSBTTokenId
    await client.json.set(
      `${AchievementPrefix.AchievementItem}::${achievementItemId}`,
      '$',
      {
        ...achievementItem,
        claimedOnTimestamp: Date.now(),
        claimed: true,
        claimedSBTTokenId: claimedSBTTokenId,
      },
    )

    await client.quit()

    // 10. Return response.
    return new Response(
      JSON.stringify({ id: achievementItemId, claimedSBTTokenId }),
      { status: 200 },
    )
  }

export default handler
