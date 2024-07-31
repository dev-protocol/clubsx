import useSWR from 'swr'
import type { UndefinedOr } from '@devprotocol/util-ts'
import React, {
  type FunctionComponent,
  useState,
  useEffect,
  type ChangeEvent,
  useMemo,
  useContext,
} from 'react'

import { Strings } from '../i18n'
import { Market } from '../types'
import { useQuery } from '../utils'
import { TokenizeContext } from 'src/context/TokenizeContext'
import { i18nFactory, type ClubsI18nFunction } from '@devprotocol/clubs-core'

interface IDiscordAuthCallbackProps {
  market: UndefinedOr<Market>
}

const REQUIRED_PERMISSIONS = 8 // Administrator

const DiscordAuthCallbackPage: FunctionComponent<IDiscordAuthCallbackProps> = (
  props: IDiscordAuthCallbackProps,
) => {
  let i18nBase = i18nFactory(Strings)
  let i18n: ClubsI18nFunction<typeof Strings> = i18nBase(['en'])

  const { assetName, setAssetName, setPersonalAccessToken } =
    useContext(TokenizeContext)

  const [isVerify, setIsVerify] = useState<boolean>(false)
  const [error, setError] = useState<UndefinedOr<string>>('')
  const [market, setMarket] = useState<UndefinedOr<Market>>(undefined)

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

  const swrOptions = {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    focusThrottleInterval: 0,
  }

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
            res.access_token && setIsVerify(true)
            return { accessToken: res.access_token }
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

    if (!isVerify) {
      return setError('Invalid Authentication!')
    }

    setPersonalAccessToken(accessTokenData?.data?.accessToken)
  }, [
    setMarket,
    market,
    guildData,
    isVerify,
    setPersonalAccessToken,
    accessTokenData,
    setAssetName,
  ])

  const onSubmit = () => {
    if (!assetName) {
      return setError('Please select a guild')
    }

    window.location.href = new URL(
      `/${clubsDomain}/setup`,
      `${location.protocol}//${location.host}`,
    ).toString()
  }

  return (
    <>
      <div className="relative flex gap-16 flex-col justify-center p-4 md:p-0 w-[36%] max-w-[36%] ml-auto mr-auto">
        <section className="mt-16 grid gap-8 md:mt-32 min-w-full w-full max-w-full">
          <h1 className="text-2xl font-bold md:text-5xl text-center">
            {i18n('DiscordAuthCallbackHeader')}
          </h1>
          <p>{i18n('DiscordAuthCallbackSubHeader')}</p>
        </section>

        {error && (
          <section className="grid gap-16 w-full max-w-full mb-16 md:mb-32">
            <span className="text-base font-normal text-center">
              {i18n('DiscordAuthCallbackError')}
            </span>
          </section>
        )}

        {guildData && guildData.data && !guildData.data.length && (
          <section className="grid gap-16 w-full max-w-full mb-16 md:mb-32">
            <span className="text-base font-normal text-center">
              {i18n('DiscordAuthCallbackNoGuild')}
            </span>
          </section>
        )}

        {guildData && guildData.data && guildData.data.length && (
          <section className="grid gap-16 w-full max-w-full mb-16 md:mb-32 gap-4">
            {guildData.data.map((d: any, i: number) => (
              <label className="flex flex-row items-center gap-2" key={i}>
                <input
                  type="radio"
                  name="guild"
                  value={d.id}
                  onChange={(e) => setAssetName(e?.target?.value || '')}
                />
                {d.icon === null ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                    <div className="text-xl text-black">
                      {d.name.slice(0, 2)}
                    </div>
                  </div>
                ) : (
                  <img
                    className="h-16 w-16 rounded-full"
                    src={`https://cdn.discordapp.com/icons/${d.id}/${d.icon}.png`}
                    alt={`${d.name} guild icon`}
                  />
                )}
                <span className="text-xl">
                  {d.id} ({i18n('DiscordAuthCallbackGuildName')}: {d.name})
                </span>
              </label>
            ))}

            <button
              disabled={!assetName}
              className={`hs-button is-filled is-error w-fit py-6 px-8`}
              onClick={onSubmit}
            >
              <span className="hs-button__label">{i18n('Next')}</span>
            </button>
          </section>
        )}
      </div>
    </>
  )
}

export default DiscordAuthCallbackPage
