import useSWR from 'swr'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  decode,
  encode,
  i18nFactory,
  type ClubsI18nFunction,
} from '@devprotocol/clubs-core'
import React, {
  type FunctionComponent,
  useState,
  useEffect,
  useMemo,
} from 'react'

import { Strings } from '../i18n'
import { useQuery } from '../utils'
import { Market, type IAuthCallbackProp } from '../types'

type YTChannel = {
  channelId: string
  videoCount: string
  viewCount: string
  keywords?: string
  title: string
  description: string
}

const YoutubeAuthCallbackPage: FunctionComponent<IAuthCallbackProp> = (
  props: IAuthCallbackProp,
) => {
  let i18nBase = i18nFactory(Strings)
  let i18n: ClubsI18nFunction<typeof Strings> = i18nBase(['en'])

  const [assetName, setAssetName] = useState<string>('')
  const [isVerify, setIsVerify] = useState<boolean>(false)
  const [error, setError] = useState<UndefinedOr<string>>('')
  const [personalAccessToken, setPersonalAccessToken] = useState<string>('')

  useEffect(() => {
    i18n = i18nBase(navigator.languages)
  }, [navigator])

  const queryParams = useMemo(
    () =>
      useQuery(
        window.location.search ? window.location.search : window.location.hash,
      ),
    [useQuery, window, location],
  )

  const clientId = useMemo(
    () => import.meta.env.PUBLIC_YOUTUBE_CLIENT_ID,
    [import.meta.env],
  )

  const clubsDomain = useMemo(() => {
    const encodedStateParam: string = queryParams.state
    const decodedStateParam: { clubsDomain: string } = JSON.parse(
      window.atob(decodeURIComponent(encodedStateParam)),
    )
    return decodedStateParam.clubsDomain || ''
  }, [queryParams])

  const swrOptions = {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    focusThrottleInterval: 0,
  }

  const verifyData = useSWR(
    queryParams && queryParams.access_token !== '' ? 'google/verify' : null,
    async () => {
      const verifyUrl = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${queryParams.access_token}`
      return fetch(verifyUrl)
        .then(
          (res) => {
            if (!res || !res.ok) {
              throw new Error('Error ' + res.status + ': ' + res.statusText)
            }
            return res
          },
          (err) => {
            throw new Error(err?.message || 'Error occured')
          },
        )
        .then(
          (res) => res.json(),
          (err) => {
            throw new Error(err?.message || 'Error occured')
          },
        )
        .then(
          (res) => {
            if (res.audience !== clientId) {
              throw new Error('Invalid audience!')
            }
            setIsVerify(true)
            return { email: res.email }
          },
          (err) => {
            throw new Error(err?.message || 'Error occured')
          },
        )
        .catch((err) => {
          setError(err?.message || 'Error occured try again')
          return undefined
        })
    },
    swrOptions,
  )

  const youtubeData = useSWR<YTChannel>(
    queryParams && queryParams.access_token !== '' ? 'youtube/dataapi' : null,
    async () => {
      const youtubeDataApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=id,snippet,brandingSettings,statistics&mine=true&access_token=${queryParams.access_token}`
      return fetch(youtubeDataApiUrl)
        .then(
          (res) => {
            if (!res || !res.ok) {
              throw new Error('Error ' + res.status + ': ' + res.statusText)
            }
            return res
          },
          (err) => {
            throw new Error(err?.message || 'Error occured')
          },
        )
        .then(
          (res) => res.json(),
          (err) => {
            throw new Error(err?.message || 'Error occured')
          },
        )
        .then(
          async (res) => {
            const [data] = res.items.map((item: any) => {
              const channelId = item.id
              const videoCount = item.statistics.videoCount
              const viewCount = item.statistics.viewCount
              const keywords = item.brandingSettings.channel.keywords
              const title = item.snippet.title
              const description = item.snippet.description
              return {
                channelId,
                videoCount,
                viewCount,
                keywords,
                title,
                description,
              } satisfies YTChannel
            })
            return data
          },
          (err) => {
            throw new Error(err?.message || 'Error occured')
          },
        )
        .catch((err) => {
          setError(err?.message || 'Error occured try again')
          return undefined
        })
    },
    swrOptions,
  )

  useEffect(() => {
    if (props.market !== Market.YOUTUBE) {
      return setError('Invalid verification market!')
    }

    if (
      !queryParams ||
      !queryParams.access_token ||
      !verifyData?.data ||
      !youtubeData?.data
    ) {
      return
    }

    if (!verifyData.isLoading && !youtubeData.isLoading && !isVerify) {
      return setError('Invalid Authentication!')
    }

    setAssetName(youtubeData?.data.channelId)
    setPersonalAccessToken(queryParams.access_token)
    onSuccessfulAuth()
  }, [
    verifyData,
    isVerify,
    personalAccessToken,
    youtubeData,
    assetName,
    location,
    window,
  ])

  const onSuccessfulAuth = () => {
    if (!assetName) {
      return setError('Could not find a youtube channel.')
    }

    let onboardingData = undefined
    const rawData = sessionStorage.getItem(`${clubsDomain}-onboarding-data`)
    if (rawData) {
      onboardingData = JSON.parse(
        window.atob(decodeURIComponent(decode(rawData))),
      )
    }
    const newRawData = encode(
      encodeURIComponent(
        window.btoa(
          JSON.stringify({
            ...onboardingData,
            market: Market.YOUTUBE,
            assetName: assetName || onboardingData?.assetName || undefined,
            personalAccessToken:
              encode(personalAccessToken) ||
              onboardingData?.personalAccessToken ||
              undefined,
          }),
        ),
      ),
    )
    sessionStorage.setItem(`${clubsDomain}-onboarding-data`, newRawData)

    window.location.href = new URL(
      `/${clubsDomain}/setup`,
      `${location.protocol}//${location.host}`,
    ).toString()
  }

  return (
    <>
      <div className="relative flex gap-16 flex-col justify-center p-4 md:p-0 max-w-screen-sm container mx-auto">
        <section className="mt-16 grid gap-8 md:mt-32 min-w-full w-full max-w-full">
          <h1 className="text-2xl font-bold md:text-5xl text-center">
            {i18n('YoutubeAuthCallbackHeader')}
          </h1>
          <p className="text-center">{i18n('YoutubeAuthCallbackSubHeader')}</p>
        </section>

        {verifyData.isLoading ||
          (youtubeData.isLoading && (
            <div
              className={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 animate-pulse bg-gray-500/60`}
            >
              <p className="font-normal text-base text-white">
                {i18n('FetchingYoutubeChannel')}
              </p>
            </div>
          ))}

        {!verifyData.isLoading && !youtubeData.isLoading && error && (
          <div
            className={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 animate-pulse bg-gray-500/60`}
          >
            <p className="font-normal text-base text-center">
              {i18n('YoutubeAuthCallbackError')}
            </p>
          </div>
        )}

        {!verifyData.isLoading &&
          !youtubeData.isLoading &&
          youtubeData &&
          !youtubeData.data && (
            <div
              className={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 animate-pulse bg-gray-500/60`}
            >
              <p className="font-normal text-base text-center">
                {i18n('YoutubeAuthCallbackNoChannel')}
              </p>
            </div>
          )}

        {!verifyData.isLoading &&
          !youtubeData.isLoading &&
          youtubeData &&
          youtubeData.data && (
            <div
              className={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 animate-pulse bg-gray-500/60`}
            >
              <p className="font-normal text-base text-center">
                {i18n('YoutubeAuthCallbackChannelFound')}
              </p>
            </div>
          )}
      </div>
    </>
  )
}

export default YoutubeAuthCallbackPage
