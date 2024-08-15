import React, {
  useState,
  useEffect,
  useMemo,
  type FunctionComponent,
} from 'react'
import {
  encode,
  decode,
  i18nFactory,
  type ClubsI18nFunction,
} from '@devprotocol/clubs-core'

import { Strings } from '../i18n'
import { useQuery } from '../utils'
import { Market, type IAuthCallbackProp } from '../types'

const GithubProjectForm: FunctionComponent<IAuthCallbackProp> = (
  props: IAuthCallbackProp,
) => {
  let i18nBase = i18nFactory(Strings)
  let i18n: ClubsI18nFunction<typeof Strings> = i18nBase(['en'])

  const [assetName, setAssetName] = useState<string>('')
  const [personalAccessToken, setPersonalAccessToken] = useState<string>('')

  const queryParams = useMemo(
    () =>
      useQuery(
        window.location.search ? window.location.search : window.location.hash,
      ),
    [useQuery, window, location],
  )

  const clubsDomain = useMemo(() => {
    const encodedStateParam: string = queryParams.state
    const decodedStateParam: { clubsDomain: string } = JSON.parse(
      window.atob(decodeURIComponent(encodedStateParam)),
    )
    return decodedStateParam.clubsDomain || ''
  }, [queryParams])

  const onSubmit = () => {
    if (!assetName || !personalAccessToken) {
      console.error('Missing required details!')
      return
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
            market: Market.GITHUB,
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

  useEffect(() => {
    i18n = i18nBase(navigator.languages)
  }, [navigator])

  return (
    <>
      <div className="relative flex gap-16 flex-col justify-center p-4 md:p-0 w-[36%] max-w-[36%] ml-auto mr-auto">
        <section className="mt-16 grid gap-8 md:mt-32 min-w-full w-full max-w-full">
          <h1 className="text-2xl font-bold md:text-5xl text-center">
            {i18n('GithubProjectInfoHeader')}
          </h1>
          <p className="text-center">{i18n('GithubProjectInfoSubHeader')}</p>
        </section>

        <section className="grid gap-16 w-full max-w-full mb-16 md:mb-32">
          <label className="hs-form-field is-filled is-required">
            <span className="hs-form-field__label">
              {i18n('GithubAssetNameLabel')}
            </span>
            <input
              className="hs-form-field__input w-full"
              type="text"
              value={assetName}
              placeholder="owner-name/repository-name"
              onChange={(ev) => setAssetName(ev?.target?.value || '')}
              id="github-asset-name"
              name="github-asset-name"
            />
            <p
              className="hs-form-field__helper mt-2"
              dangerouslySetInnerHTML={{
                __html: `${i18n('GithubAssetNameHelper')}`,
              }}
            ></p>
          </label>

          <label className="hs-form-field is-filled is-required">
            <span className="hs-form-field__label">
              {i18n('PersonalAccessTokenLabel')}
            </span>
            <input
              className="hs-form-field__input w-full"
              type="text"
              value={personalAccessToken}
              onChange={(ev) => setPersonalAccessToken(ev?.target?.value || '')}
              id="github-pat"
              name="github-pat"
            />
            <p
              className="hs-form-field__helper mt-2"
              dangerouslySetInnerHTML={{
                __html: `${i18n('PersonalAccessTokenHelper')}`,
              }}
            ></p>
          </label>

          <div className="flex w-full justify-end gap-[20px]">
            <button
              disabled={!assetName || !personalAccessToken}
              className={`hs-button is-filled is-error w-fit py-6 px-8`}
              onClick={onSubmit}
            >
              <span className="hs-button__label">{i18n('Next')}</span>
            </button>
          </div>
        </section>
      </div>
    </>
  )
}

export default GithubProjectForm
