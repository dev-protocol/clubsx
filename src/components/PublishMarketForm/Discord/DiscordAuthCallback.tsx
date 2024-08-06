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
  type SyntheticEvent,
} from 'react'

import { Strings } from '../i18n'
import { Market } from '../types'
import { useQuery } from '../utils'

interface IDiscordAuthCallbackProps {
  market: UndefinedOr<Market>
}

const REQUIRED_PERMISSIONS = 8 // Administrator

const DiscordAuthCallbackPage: FunctionComponent<IDiscordAuthCallbackProps> = (
  props: IDiscordAuthCallbackProps,
) => {
  let i18nBase = i18nFactory(Strings)
  let i18n: ClubsI18nFunction<typeof Strings> = i18nBase(['en'])
  const swrOptions = {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    focusThrottleInterval: 0,
  }

  const [assetName, setAssetName] = useState<string>('')
  const [isVerify, setIsVerify] = useState<boolean>(false)
  const [error, setError] = useState<UndefinedOr<string>>('')
  const [market, setMarket] = useState<UndefinedOr<Market>>(undefined)
  const [personalAccessToken, setPersonalAccessToken] = useState<string>('')

  useEffect(() => {
    i18n = i18nBase(navigator.languages)
  }, [navigator])

  const [queryParams, redirectURI] = useMemo(
    () => [
      useQuery(
        window.location.search ? window.location.search : window.location.hash,
      ),
      `${location.protocol}//${location.host}/auth/callback/discord`,
    ],
    [useQuery, window, location],
  )

  const [clientId, clientSecret] = useMemo(
    () => [
      import.meta.env.PUBLIC_DISCORD_CLIENT_ID,
      import.meta.env.PUBLIC_DISCORD_CLIENT_SECRET,
    ],
    [import.meta.env],
  )

  const clubsDomain = useMemo(() => {
    const encodedStateParam: string = queryParams.state
    const decodedStateParam: { clubsDomain: string } = JSON.parse(
      window.atob(decodeURIComponent(encodedStateParam)),
    )
    return decodedStateParam.clubsDomain || ''
  }, [queryParams])

  const accessTokenData = useSWR(
    queryParams && queryParams.code ? 'discord/verify' : null,
    async () => {
      const verifyUrl = `https://discord.com/api/oauth2/token`
      const body = new URLSearchParams({
        client_id: clientId as string,
        client_secret: clientSecret as string,
        grant_type: 'authorization_code',
        code: (queryParams.code as string) || '',
        redirect_uri: redirectURI,
      })

      return await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      })
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
            if (res.scope !== 'guilds') {
              throw new Error('Invalid audience!')
            }
            setIsVerify(true)
            return { accessToken: res.access_token }
          },
          (err) => {
            throw new Error(err?.message || 'Error occured')
          },
        )
        .catch((err) => {
          console.log('Err', err)
          setError(err?.message || 'Error occured try again')
          return undefined
        })
    },
    swrOptions,
  )

  const guildData = useSWR(
    accessTokenData && accessTokenData.data?.accessToken
      ? 'discord/dataapi'
      : null,
    async () => {
      if (
        !accessTokenData ||
        !accessTokenData.data ||
        !accessTokenData.data.accessToken
      ) {
        return undefined
      }

      const discordGuildApiUrl = `https://discord.com/api/users/@me/guilds`
      return fetch(discordGuildApiUrl, {
        headers: {
          Authorization: `Bearer ${accessTokenData.data.accessToken}`,
        },
      })
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
          (data) =>
            data.filter(
              (d: any) =>
                (REQUIRED_PERMISSIONS & d.permissions) === REQUIRED_PERMISSIONS,
            ),
          (err) => {
            throw new Error(err?.message || 'Error occured')
          },
        )
        .catch((err) => {
          console.log('Err', err)
          setError(err?.message || 'Error occured try again')
          return undefined
        })
    },
    swrOptions,
  )

  useEffect(() => {
    setMarket(Market.DISCORD)

    if (props.market !== Market.DISCORD) {
      return setError('Invalid verification market!')
    }

    if (accessTokenData === undefined || guildData === undefined) {
      return
    }

    if (!accessTokenData.isLoading && !guildData.isLoading && !isVerify) {
      return setError('Invalid authentication!')
    }

    setError('')
    setPersonalAccessToken(accessTokenData?.data?.accessToken)
  }, [
    setMarket,
    market,
    guildData,
    isVerify,
    personalAccessToken,
    accessTokenData,
    assetName,
  ])

  const onSubmit = () => {
    if (!assetName) {
      return setError('Please select a guild')
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

  const fallbackGuildImg = (ev: SyntheticEvent<HTMLImageElement, Event>) =>
    ((ev.target as HTMLImageElement).src = `<svg
          width="28"
          height="22"
          viewBox="0 0 28 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23.256 2.40814C21.5074 1.58851 19.6573 1.0056 17.7547 0.674805C17.4949 1.15145 17.2595 1.64097 17.0493 2.14147C15.0286 1.83347 12.9728 1.83347 10.952 2.14147C10.7402 1.64036 10.5021 1.15079 10.2387 0.674805C8.33457 1.00485 6.48308 1.58778 4.73334 2.40814C1.65283 6.97278 0.297293 12.4847 0.909342 17.9575C2.89858 19.4611 5.13919 20.5992 7.52668 21.3188C8.07334 20.5668 8.55734 19.7721 8.97201 18.9388C8.18234 18.6384 7.42109 18.268 6.69734 17.8321C6.88801 17.6908 7.07468 17.5428 7.25468 17.3908C9.35904 18.4038 11.6645 18.9298 14 18.9298C16.3355 18.9298 18.641 18.4038 20.7453 17.3908C20.928 17.5428 21.1147 17.6908 21.3027 17.8321C20.5773 18.2695 19.8147 18.6401 19.0227 18.9415C19.4377 19.7735 19.9211 20.5696 20.468 21.3215C22.9025 20.5689 25.1873 19.398 27.22 17.8615C27.7804 12.4027 26.3748 6.92311 23.256 2.40814ZM9.57068 14.7508C8.8926 14.7028 8.26067 14.3899 7.81154 13.8796C7.36241 13.3694 7.13219 12.7028 7.17068 12.0241C7.12791 11.3442 7.35656 10.675 7.80646 10.1633C8.25637 9.6517 8.89082 9.33935 9.57068 9.2948C9.90805 9.31479 10.2381 9.40145 10.5418 9.54977C10.8455 9.6981 11.1167 9.90514 11.3399 10.1589C11.5631 10.4127 11.7337 10.7082 11.842 11.0284C11.9503 11.3485 11.994 11.687 11.9707 12.0241C12.0131 12.7038 11.7842 13.3724 11.3343 13.8836C10.8844 14.3947 10.2502 14.7066 9.57068 14.7508ZM18.4293 14.7508C17.7513 14.7028 17.1193 14.3899 16.6702 13.8796C16.2211 13.3694 15.9909 12.7028 16.0293 12.0241C15.9866 11.3442 16.2152 10.675 16.6651 10.1633C17.115 9.6517 17.7495 9.33935 18.4293 9.2948C18.7667 9.31497 19.0966 9.40174 19.4002 9.55012C19.7038 9.6985 19.975 9.90555 20.1981 10.1593C20.4213 10.4131 20.5919 10.7085 20.7003 11.0286C20.8086 11.3487 20.8525 11.687 20.8293 12.0241C20.8714 12.7037 20.6424 13.3722 20.1926 13.8832C19.7427 14.3943 19.1087 14.7062 18.4293 14.7508Z"
            fill="white"
          />
        </svg>`)

  return (
    <>
      <div className="relative flex gap-16 flex-col justify-center p-4 md:p-0 w-[36%] max-w-[36%] ml-auto mr-auto">
        <section className="mt-16 grid gap-8 md:mt-32 min-w-full w-full max-w-full">
          <h1 className="text-2xl font-bold md:text-5xl text-center">
            {i18n('DiscordAuthCallbackHeader')}
          </h1>
          <p className="text-center">{i18n('DiscordAuthCallbackSubHeader')}</p>
        </section>

        {accessTokenData.isLoading ||
          (guildData.isLoading && (
            <div
              className={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 animate-pulse bg-gray-500/60`}
            >
              <p className="font-normal text-base text-white">
                {i18n('FetchingDiscordGuild')}
              </p>
            </div>
          ))}

        {!accessTokenData.isLoading && !guildData.isLoading && error && (
          <div
            className={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 animate-pulse bg-gray-500/60`}
          >
            <p className="font-normal text-base text-center">
              {i18n('DiscordAuthCallbackError')}
            </p>
          </div>
        )}

        {!accessTokenData.isLoading &&
          !guildData.isLoading &&
          guildData &&
          guildData.data &&
          !guildData.data.length && (
            <div
              className={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 animate-pulse bg-gray-500/60`}
            >
              <p className="font-normal text-base text-center">
                {i18n('DiscordAuthCallbackNoGuild')}
              </p>
            </div>
          )}

        {!accessTokenData.isLoading &&
          !guildData.isLoading &&
          guildData &&
          guildData.data &&
          guildData.data.length && (
            <>
              <section
                className={`grid gap-16 w-full max-w-full mb-16 md:mb-32 border-2px !border-white`}
              >
                {guildData.data.map((d: any, i: number) => (
                  <label
                    className="flex flex-row items-center justify-start gap-6 !border-white"
                    key={i}
                  >
                    <input
                      type="radio"
                      name="guild"
                      value={d.id}
                      onChange={(e) => setAssetName(e?.target?.value || '')}
                    />
                    {!d.icon ? (
                      <div className="max-h-8 max-w-8 h-auto w-auto rounded-full">
                        <svg
                          width="28"
                          height="22"
                          viewBox="0 0 28 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M23.256 2.40814C21.5074 1.58851 19.6573 1.0056 17.7547 0.674805C17.4949 1.15145 17.2595 1.64097 17.0493 2.14147C15.0286 1.83347 12.9728 1.83347 10.952 2.14147C10.7402 1.64036 10.5021 1.15079 10.2387 0.674805C8.33457 1.00485 6.48308 1.58778 4.73334 2.40814C1.65283 6.97278 0.297293 12.4847 0.909342 17.9575C2.89858 19.4611 5.13919 20.5992 7.52668 21.3188C8.07334 20.5668 8.55734 19.7721 8.97201 18.9388C8.18234 18.6384 7.42109 18.268 6.69734 17.8321C6.88801 17.6908 7.07468 17.5428 7.25468 17.3908C9.35904 18.4038 11.6645 18.9298 14 18.9298C16.3355 18.9298 18.641 18.4038 20.7453 17.3908C20.928 17.5428 21.1147 17.6908 21.3027 17.8321C20.5773 18.2695 19.8147 18.6401 19.0227 18.9415C19.4377 19.7735 19.9211 20.5696 20.468 21.3215C22.9025 20.5689 25.1873 19.398 27.22 17.8615C27.7804 12.4027 26.3748 6.92311 23.256 2.40814ZM9.57068 14.7508C8.8926 14.7028 8.26067 14.3899 7.81154 13.8796C7.36241 13.3694 7.13219 12.7028 7.17068 12.0241C7.12791 11.3442 7.35656 10.675 7.80646 10.1633C8.25637 9.6517 8.89082 9.33935 9.57068 9.2948C9.90805 9.31479 10.2381 9.40145 10.5418 9.54977C10.8455 9.6981 11.1167 9.90514 11.3399 10.1589C11.5631 10.4127 11.7337 10.7082 11.842 11.0284C11.9503 11.3485 11.994 11.687 11.9707 12.0241C12.0131 12.7038 11.7842 13.3724 11.3343 13.8836C10.8844 14.3947 10.2502 14.7066 9.57068 14.7508ZM18.4293 14.7508C17.7513 14.7028 17.1193 14.3899 16.6702 13.8796C16.2211 13.3694 15.9909 12.7028 16.0293 12.0241C15.9866 11.3442 16.2152 10.675 16.6651 10.1633C17.115 9.6517 17.7495 9.33935 18.4293 9.2948C18.7667 9.31497 19.0966 9.40174 19.4002 9.55012C19.7038 9.6985 19.975 9.90555 20.1981 10.1593C20.4213 10.4131 20.5919 10.7085 20.7003 11.0286C20.8086 11.3487 20.8525 11.687 20.8293 12.0241C20.8714 12.7037 20.6424 13.3722 20.1926 13.8832C19.7427 14.3943 19.1087 14.7062 18.4293 14.7508Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    ) : (
                      <img
                        className="max-h-8 max-w-8 h-auto w-auto rounded-full"
                        src={`https://cdn.discordapp.com/icons/${d.id}/${d.icon}.png`}
                        alt={`${d.name} guild icon`}
                        onError={fallbackGuildImg}
                      />
                    )}
                    <div className="flex flex-wrap justify-start content-center gap-2 w-full max-w-full">
                      <p className="text-base">
                        {i18n('DiscordAuthCallbackGuildName', [d.name])}
                      </p>
                      <p className="hs-form-field__helper">
                        {i18n('DiscordGuildId', [
                          `${d.id.substring(0, 4)}...${d.id.substring(d.id.length - 4, d.id.length)}`,
                        ])}
                      </p>
                    </div>
                  </label>
                ))}

                <button
                  disabled={!assetName || !personalAccessToken}
                  className={`hs-button is-filled is-error w-fit py-6 px-8`}
                  onClick={onSubmit}
                >
                  <span className="hs-button__label">{i18n('Next')}</span>
                </button>
              </section>
            </>
          )}
      </div>
    </>
  )
}

export default DiscordAuthCallbackPage
