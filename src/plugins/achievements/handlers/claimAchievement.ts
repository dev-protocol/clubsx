import { verifyMessage } from 'ethers'

import {
  whenNotErrorAll,
  type UndefinedOr,
  whenNotError,
  whenDefinedAll,
  whenDefined,
  isNotError,
} from '@devprotocol/util-ts'

import { getDefaultClient, withCheckingIndex } from '../db/redis'
import { ACHIEVEMENT_DIST_SCHEMA } from '../db/schema'
import {
  type AchievementDist,
  type AchievementInfo,
  type ClaimAchievementApiHandlerParams,
  type StringAttribute,
} from '../types'
import {
  AchievementIndex,
  AchievementPrefix,
  checkForExistingAchievementInfo,
  uuidToQuery,
  clubsUrlToKeccak256Tag,
  checkForExistingAchievementDist,
  claimableOrNot,
  getAchievementItemDocument,
  generateKey,
} from '../utils'
import { tryCatch } from 'ramda'

const ERROR = {
  $400: {
    MISSINGDATA: 'Missing data.',
    BADID: 'Bad achievement data',
    IDNOTFOUND: 'ID is not found',
    BADSENTDATA: 'Bad data sent to api',
    INFONOTFOUND: 'Achievement metadata is not found',
  },
  $500: {
    MINTERROR: 'Mint api failed',
  },
}

export const handler =
  ({ rpcUrl, chainId, property, url }: ClaimAchievementApiHandlerParams) =>
  async ({ request }: { readonly request: Request }) => {
    // 1. Get the req data.
    const reqBody = (await request.json().catch((err: Error) => err)) as {
      message: string
      signature: string
      achievementDistId: string
    }
    const props =
      whenDefinedAll(
        [reqBody.message, reqBody.signature, reqBody.achievementDistId],
        ([message, signature, distId]) => ({
          message,
          signature,
          distId,
        }),
      ) ?? new Error(ERROR.$400.MISSINGDATA)

    // 2. Get client and validate it.
    const client = await withCheckingIndex(getDefaultClient).catch(
      (err: Error) => err,
    )

    const testIfAchvDistExists = await whenNotErrorAll(
      [props, client],
      ([{ distId }, redis]) =>
        checkForExistingAchievementDist(distId, redis)
          .then((x) => (x ? x : new Error(ERROR.$400.BADID)))
          .catch((err: Error) => err),
    )

    // 4. Fetch the mapped achievement documents.
    const achievementDistData = await whenNotErrorAll(
      [props, client, testIfAchvDistExists],
      ([{ distId: _id }, _client]) =>
        _client.ft
          .search(
            AchievementIndex.AchievementDist,
            `@${ACHIEVEMENT_DIST_SCHEMA['$.id'].AS}:{${uuidToQuery(_id)}} @${ACHIEVEMENT_DIST_SCHEMA['$.clubsUrl'].AS}:{${clubsUrlToKeccak256Tag(url)}}`,
            {
              LIMIT: {
                from: 0,
                size: 1,
              },
            },
          )
          .catch((err: Error) => err),
    )
    // 5. Fetch achievement from mapped documents.
    const achievementDist = whenNotError(
      achievementDistData,
      (d) =>
        (d.documents.find((x) => x.value)
          ?.value as UndefinedOr<AchievementDist>) ??
        new Error(ERROR.$400.IDNOTFOUND),
    )

    // 7. Validated achievement ids are matched and that achievement info also exists
    const testIfHaveMappedAchvInfo = await whenNotErrorAll(
      [achievementDist, client],
      ([data, redis]) =>
        checkForExistingAchievementInfo(data.achievementInfoId, redis)
          .then((r) => (r ? r : new Error(ERROR.$400.BADSENTDATA)))
          .catch((err: Error) => err),
    )

    // 8. Get the msg.sender / claimer addr.
    const account = whenNotError(props, ({ message, signature }) =>
      tryCatch(
        (msg: string, sig: string) => verifyMessage(msg, sig),
        (err: Error) => err,
      )(message, signature),
    )

    // 9. Validate if achievement is claimable.
    const claimable = await whenNotErrorAll(
      [props, account, client, testIfHaveMappedAchvInfo],
      ([{ distId }, address, redis]) =>
        claimableOrNot(distId, address, redis).catch((err: Error) => err),
    )

    const testClaimable = whenNotError(claimable, (test) =>
      test.result ? true : new Error(test.reason),
    )

    // 10. Fetch achievement info document.
    const achievementInfoDocument = await whenNotErrorAll(
      [achievementDist, client, testClaimable],
      ([_achievementItem, _client]) =>
        _client.json
          .get(
            generateKey(
              AchievementPrefix.AchievementInfo,
              _achievementItem.achievementInfoId,
            ),
          )
          .catch((err: Error) => err),
    )

    const achievementInfo = whenNotError(
      achievementInfoDocument,
      (d) =>
        (d as UndefinedOr<AchievementInfo>) ??
        new Error(ERROR.$400.INFONOTFOUND),
    )

    // Add `Property: PROPERTY_VALUE` to the metadata
    const metadata = whenNotError(achievementInfo, ({ metadata }) =>
      ((propertyKey) => {
        const { stringAttributes } = metadata
        const nextStringAttributes: StringAttribute[] = [
          ...stringAttributes.filter(
            ({ trait_type }) => trait_type !== propertyKey,
          ),
          { trait_type: propertyKey, value: property },
        ]
        return {
          ...metadata,
          stringAttributes: nextStringAttributes,
        }
      })('Property'),
    )

    // 11. Call the mint api (send.devprotocol.xyz)
    const { SEND_DEVPROTOCOL_API_KEY } =
      import.meta.env ||
      process.env ||
      ({ SEND_DEVPROTOCOL_API_KEY: '' } as {
        SEND_DEVPROTOCOL_API_KEY: string
      })
    const mintApiResponse = await whenNotErrorAll(
      [achievementDist, achievementInfo, metadata, account],
      ([dist, info, _metadata, to]) =>
        fetch(
          `https://send.devprotocol.xyz/api/send-transactions/AchievementsSBT/${info.contract}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SEND_DEVPROTOCOL_API_KEY}`,
            },
            body: JSON.stringify({
              requestId: `${dist.id}${to}`, // achievementItem.id + user signing EOA
              rpcUrl,
              chainId,
              metadata: _metadata,
              to,
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
          .catch((err: Error) => {
            return err
          }),
    )
    const testMintApiResult = whenNotError(
      mintApiResponse,
      (res) =>
        whenDefined(res.claimedSBTTokenId, (i) =>
          i ? true : new Error(ERROR.$500.MINTERROR),
        ) ?? new Error(ERROR.$500.MINTERROR),
    )

    // 11. Update the record to mark the achievement as claimed.
    const achievementItem = whenNotErrorAll(
      [
        mintApiResponse,
        account,
        achievementDist,
        achievementInfo,
        testMintApiResult,
      ],
      ([{ claimedSBTTokenId }, _account, dist, info]) =>
        getAchievementItemDocument({
          account: _account,
          achievementInfoId: info.id,
          achievementDistId: dist.id,
          claimedOnTimestamp: Date.now(),
          claimedSBTTokenId: claimedSBTTokenId,
          clubsUrl: clubsUrlToKeccak256Tag(url),
        }),
    )

    const stored = await whenNotErrorAll(
      [achievementItem, client],
      ([item, redis]) =>
        redis.json
          .set(
            generateKey(AchievementPrefix.AchievementItem, item.id),
            '$',
            item,
          )
          .catch((err: Error) => err),
    )

    await whenNotError(client, (redis) => redis.quit())

    const res = whenNotErrorAll(
      [stored, achievementItem, achievementDist, mintApiResponse],
      ([_, item, dist, mintApi]) => ({ item, dist, mintApi }),
    )

    return new Response(
      isNotError(res)
        ? JSON.stringify({
            id: res.item.id,
            claimedSBTTokenId: res.mintApi.claimedSBTTokenId,
          })
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
