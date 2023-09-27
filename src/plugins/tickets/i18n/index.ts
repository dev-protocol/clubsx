import type { UndefinedOr } from '@devprotocol/util-ts'

export enum Parts {
  SignToUseThisBenefit = ';1',
  AfterSigningThisWillBeAvailable = ';2',
  AvailableUntil = ';3',
  WillBeAvailableWhenXIsUsed = ';4',
  WillBeAvailable = ';5',
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
