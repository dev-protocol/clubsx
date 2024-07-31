import React, { useState, useEffect, useMemo } from 'react'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { i18nFactory, type ClubsI18nFunction } from '@devprotocol/clubs-core'

import { Strings } from './i18n'
import { Market } from '../PublishMarketForm/types'
import DiscordMarketButton from '@components/PublishMarketForm/Discord/Discord'

interface IPublishFormProps {
  domain: string
}

const PublishForm = (props: IPublishFormProps) => {
  let i18nBase = i18nFactory(Strings)
  let i18n: ClubsI18nFunction<typeof Strings> = i18nBase(['en'])

  const [clubsName, setClubsName] = useState<String>('')
  const [tokenName, setTokenName] = useState<String>('')
  const [tokenSymbol, setTokenSymbol] = useState<String>('')
  const [market, setMarket] = useState<UndefinedOr<Market>>(undefined)

  useEffect(() => {
    i18n = i18nBase(navigator.languages)
  }, [navigator])

  const toPublishConfirm = async () => {
    // TODO: add validations for input field.
    window.location.href = new URL(
      `${props.domain}/setup/confirm?clubsName=${clubsName}&tokenName=${tokenName}&tokenSymbol=${tokenSymbol}`,
      `${location.protocol}//${location.host}`,
    ).toString()
  }

  return (
    <>
      <div className="relative flex gap-16 flex-col justify-center p-4 md:p-0 w-[36%] max-w-[36%] ml-auto mr-auto">
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
              value={clubsName as string}
              onChange={(ev) => setClubsName(ev?.target?.value || '')}
              id="clubs-name"
              name="clubs-name"
            />
            <p className="hs-form-field__helper mt-2">
              * {i18n('ClubNameHelper', [props.domain])}
            </p>
          </label>

          <div className="hs-form-field is-filled is-required">
            <span className="hs-form-field__label">
              {' '}
              {i18n('VerifyYouLabel')}{' '}
            </span>
            <div className="flex w-full max-w-full h-28 max-h-[28] items-center justify-start gap-2">
              <DiscordMarketButton market={market} changeMarket={setMarket} />
              <DiscordMarketButton market={market} changeMarket={setMarket} />
              <DiscordMarketButton market={market} changeMarket={setMarket} />
            </div>
            <p
              className={`${!market && 'hs-form-field__helper'} mt-2 font-body font-bold text-base capitalize`}
              dangerouslySetInnerHTML={{
                __html: `${i18n('VerifiedYouHelper', [market])}`,
              }}
            ></p>
          </div>

          <label className="hs-form-field is-filled is-required">
            <span className="hs-form-field__label">
              {i18n('TokenNameLabel')}
            </span>
            <input
              className="hs-form-field__input w-full"
              type="text"
              value={tokenName as string}
              onChange={(ev) => setTokenName(ev?.target?.value || '')}
              id="token-name"
              name="token-name"
            />
            <p className="hs-form-field__helper mt-2">
              * {i18n('TokenNameHelper')}
            </p>
          </label>

          <label className="hs-form-field is-filled is-required">
            <span className="hs-form-field__label">
              {i18n('TokenSymbolLabel')}
            </span>
            <input
              className="hs-form-field__input w-full"
              type="text"
              value={tokenSymbol as string}
              onChange={(ev) => setTokenSymbol(ev?.target?.value || '')}
              id="token-symbol"
              name="token-symbol"
            />
            <p className="hs-form-field__helper mt-2">
              * {i18n('TokenSymbolHelper')}
            </p>
          </label>

          <div className="flex w-full justify-end gap-[20px]">
            <button
              className={`hs-button is-filled is-error w-fit py-6 px-8 ${
                false ? 'animate-pulse bg-gray-500/60' : ''
              }`}
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
