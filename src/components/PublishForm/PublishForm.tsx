import type { UndefinedOr } from '@devprotocol/util-ts'
import React, { useState, useEffect, useMemo } from 'react'
import {
  encode,
  decode,
  i18nFactory,
  type ClubsI18nFunction,
} from '@devprotocol/clubs-core'

import { Strings } from './i18n'
import { Market } from '../PublishMarketForm/types'
import GithubMarketButton from '@components/PublishMarketForm/Github/Github'
import DiscordMarketButton from '@components/PublishMarketForm/Discord/Discord'
import YoutubeMarketButton from '@components/PublishMarketForm/Youtube/Youtube'

interface IPublishFormProps {
  domain: string
}

const PublishForm = (props: IPublishFormProps) => {
  let i18nBase = i18nFactory(Strings)
  let i18n: ClubsI18nFunction<typeof Strings> = i18nBase(['en'])

  const [clubsName, setClubsName] = useState<string>('')
  const [tokenName, setTokenName] = useState<string>('')
  const [assetName, setAssetName] = useState<string>('')
  const [tokenSymbol, setTokenSymbol] = useState<string>('')
  const [isCreatemode, setIsCreateMode] = useState<boolean>(true)
  const [market, setMarket] = useState<UndefinedOr<Market>>(undefined)
  const [tokenizedPropertyAddr, setTokenizedPropertyAddr] = useState<string>('')

  useEffect(() => {
    const rawData = sessionStorage.getItem(`${props.domain}-onboarding-data`)
    if (!rawData) {
      setMarket(undefined)
      setAssetName('')
      return
    }

    const onboardingData = JSON.parse(
      window.atob(decodeURIComponent(decode(rawData))),
    )
    setMarket(onboardingData.market)
    setClubsName(onboardingData.clubsName)
    setTokenName(onboardingData.tokenName)
    setAssetName(onboardingData.assetName)
    setTokenSymbol(onboardingData.tokenSymbol)
  }, [window, sessionStorage])

  useEffect(() => {
    let onboardingData = undefined
    const rawData = sessionStorage.getItem(`${props.domain}-onboarding-data`)
    if (rawData) {
      onboardingData = JSON.parse(
        window.atob(decodeURIComponent(decode(rawData))),
      )
    }

    const newRawData = encode(
      encodeURIComponent(
        window.btoa(
          JSON.stringify({
            clubsName,
            tokenName,
            tokenSymbol,
            market: onboardingData?.market || undefined,
            assetName: onboardingData?.assetName || undefined,
            personalAccessToken:
              onboardingData?.personalAccessToken || undefined,
          }),
        ),
      ),
    )
    sessionStorage.setItem(`${props.domain}-onboarding-data`, newRawData)
  }, [clubsName, tokenName, tokenSymbol])

  useEffect(() => {
    i18n = i18nBase(navigator.languages)
  }, [navigator])

  const toPublishConfirm = async () => {
    if (
      !props.domain ||
      !clubsName ||
      !market ||
      !tokenName ||
      !tokenSymbol ||
      !assetName
    ) {
      console.error('Missing required details!')
      return
    }

    // TODO: add validations for input field.
    window.location.href = new URL(
      `${props.domain}/setup/confirm`,
      `${location.protocol}//${location.host}`,
    ).toString()
  }

  const isNexBtnDisabled = useMemo(() => {
    if (isCreatemode) {
      return (
        !props.domain ||
        !clubsName ||
        !market ||
        !tokenName ||
        !tokenSymbol ||
        !assetName
      )
    }

    return !props.domain || !clubsName || !tokenizedPropertyAddr
  }, [
    props.domain,
    clubsName,
    market,
    tokenName,
    tokenSymbol,
    assetName,
    tokenizedPropertyAddr,
  ])

  return (
    <>
      <div className="relative flex gap-16 flex-col justify-center p-4 md:p-0 max-w-screen-sm	container mx-auto">
        <section className="mt-16 grid gap-8 md:mt-32 min-w-full w-full max-w-full">
          <h1 className="text-2xl font-bold md:text-5xl text-center">
            {i18n('Header')}
          </h1>
          <p>{i18n('SubHeader')}</p>
        </section>

        <section className="grid gap-16 w-full max-w-full mb-16 md:mb-32">
          <label className="hs-form-field is-filled is-required">
            <span className="hs-form-field__label">
              {i18n('ClubNameLabel')}
            </span>
            <input
              className="hs-form-field__input w-full"
              type="text"
              value={clubsName}
              onChange={(ev) => setClubsName(ev?.target?.value || '')}
              id="clubs-name"
              name="clubs-name"
            />
            <p className="hs-form-field__helper mt-2">
              * {i18n('ClubNameHelper', [props.domain])}
            </p>
          </label>

          <label className="hs-form-field is-filled">
            <span
              className="hs-form-field__label underline cursor-pointer"
              onClick={() => setIsCreateMode((m) => !m)}
            >
              {i18n('TokenizeModeLabel', [
                isCreatemode ? 'create' : 'existing',
              ])}
            </span>
            {!isCreatemode && (
              <>
                <input
                  className="hs-form-field__input w-full"
                  type="text"
                  value={tokenizedPropertyAddr}
                  onChange={(ev) =>
                    setTokenizedPropertyAddr(ev?.target?.value || '')
                  }
                  id="tokenized-property-addr"
                  name="tokenized-property-addr"
                />
                <p className="hs-form-field__helper mt-2">
                  * {i18n('TokenNameHelper')}
                </p>
              </>
            )}
          </label>

          {isCreatemode && (
            <div className="hs-form-field is-filled is-required">
              <span className="hs-form-field__label">
                {' '}
                {i18n('VerifyYouLabel')}{' '}
              </span>
              <div className="grid grid-cols-3 w-full max-w-full h-28 max-h-[28] items-center justify-start gap-2">
                <YoutubeMarketButton
                  market={market}
                  changeMarket={setMarket}
                  domain={props.domain}
                />
                <DiscordMarketButton
                  market={market}
                  changeMarket={setMarket}
                  domain={props.domain}
                />
                <GithubMarketButton
                  domain={props.domain}
                  market={market}
                  changeMarket={setMarket}
                />
              </div>
              <p
                className={`${!assetName && 'hs-form-field__helper'} mt-2 font-body font-bold text-base capitalize`}
                dangerouslySetInnerHTML={{
                  __html: `${i18n('VerifiedYouHelper', [market, assetName])}`,
                }}
              ></p>
            </div>
          )}

          {isCreatemode && (
            <label className="hs-form-field is-filled is-required">
              <span className="hs-form-field__label">
                {i18n('TokenNameLabel')}
              </span>
              <input
                className="hs-form-field__input w-full"
                type="text"
                value={tokenName}
                onChange={(ev) => setTokenName(ev?.target?.value || '')}
                id="token-name"
                name="token-name"
              />
              <p className="hs-form-field__helper mt-2">
                * {i18n('TokenNameHelper')}
              </p>
            </label>
          )}

          {isCreatemode && (
            <label className="hs-form-field is-filled is-required">
              <span className="hs-form-field__label">
                {i18n('TokenSymbolLabel')}
              </span>
              <input
                className="hs-form-field__input w-full"
                type="text"
                value={tokenSymbol}
                onChange={(ev) => setTokenSymbol(ev?.target?.value || '')}
                id="token-symbol"
                name="token-symbol"
              />
              <p className="hs-form-field__helper mt-2">
                * {i18n('TokenSymbolHelper')}
              </p>
            </label>
          )}

          <div className="flex w-full justify-end gap-[20px]">
            <button
              disabled={isNexBtnDisabled}
              className={`hs-button is-filled is-error w-fit py-6 px-8`}
              onClick={toPublishConfirm}
            >
              <span className="hs-button__label">{i18n('Next')}</span>
            </button>
          </div>
        </section>
      </div>
    </>
  )
}

export default PublishForm
