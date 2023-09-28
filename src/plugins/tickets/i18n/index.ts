import type { UndefinedOr } from '@devprotocol/util-ts'

export enum Parts {
  SignToUseThisBenefit = ';1',
  AfterSigningThisWillBeAvailable = ';2',
  AvailableUntil = ';3',
  WillBeAvailableWhenXIsUsed = ';4',
  WillBeAvailable = ';5',
  ModalMessageTicketConfirm = ';6',
  ModalCloseTicketConfirm = ';7',
  ModalActionTicketConfirm = ';8',
  ModalMessageNotConnected = ';9',
  ModalCloseNotConnected = ';10',
}

export type I18nContent = ((vars: UndefinedOr<string>[]) => string) | string

export type I18nPart = Record<'en' | 'ja', I18nContent>

export type I18nFunction = (
  key: keyof typeof Strings,
  vars?: UndefinedOr<string>[],
) => string

export const Strings: Record<Parts, I18nPart> = {
  [Parts.SignToUseThisBenefit]: {
    en: 'Sign to use this benefit',
    ja: 'サインして使う',
  },
  [Parts.AfterSigningThisWillBeAvailable]: {
    en: ([time]) => `After signing, this will be available ${time}`,
    ja: ([time]) => `サインすると ${time} から使用できます`,
  },
  [Parts.AvailableUntil]: {
    en: ([time]) => `Available until ${time}`,
    ja: ([time]) => `${time} まで有効`,
  },
  [Parts.WillBeAvailableWhenXIsUsed]: {
    en: ([dep]) => `Will be available when ${dep} is used.`,
    ja: ([dep]) => `${dep} を利用しているあいだ使用できます`,
  },
  [Parts.WillBeAvailable]: {
    en: ([time]) => `Will be available ${time}.`,
    ja: ([time]) => `${time} に有効になります`,
  },
  [Parts.ModalMessageTicketConfirm]: {
    en: ([start, end, exp]) =>
      `If enabled now, it can be used up to ${end} from ${start} initially, and will expire ${exp}. Do you really want to enable it?`,
    ja: ([start, end, exp]) =>
      `有効にすると初回は ${start} から ${end} まで利用できます。有効期限は ${exp} です。本当に有効にしますか?`,
  },
  [Parts.ModalCloseTicketConfirm]: {
    en: 'Close',
    ja: '閉じる',
  },
  [Parts.ModalActionTicketConfirm]: {
    en: 'Yes',
    ja: 'はい',
  },
  [Parts.ModalMessageNotConnected]: {
    en: 'Please connect a wallet first',
    ja: 'ウォレットに接続してください',
  },
  [Parts.ModalCloseNotConnected]: {
    en: 'OK',
    ja: 'わかりました',
  },
}

const has = <T extends I18nPart>(
  base: T,
  lang: string | number | symbol,
): lang is keyof T => Object.hasOwn(base, lang)

export const i18nFactory =
  (langs: Navigator['languages']): I18nFunction =>
  (key, vars) => {
    const base = Strings[key]
    type Key = keyof typeof base
    const cand = langs.find((lang) =>
      has<typeof base>(base, lang),
    ) as UndefinedOr<Key>
    const content = cand ? base[cand] : base[Object.keys(base)[0] as Key]
    return typeof content === 'function' ? content(vars ?? []) : content
  }
