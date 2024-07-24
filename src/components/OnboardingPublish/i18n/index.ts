import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  Header: {
    en: () => 'Publish',
    ja: () => '公開',
  },
  SubHeader: {
    en: () => '',
    ja: () => '',
  },
  ClubNameLabel: {
    en: () => 'Club Name',
    ja: () => 'クラブ名',
  },
  TokenNameLabel: {
    en: () => 'Token Name',
    ja: () => 'トークン名',
  },
  TokenNameHelper: {
    en: () => 'The full name of the token. Example: Uniswap.',
    ja: () => 'トークンのフルネーム。例: Uniswap。',
  },
  TokenSymbolLabel: {
    en: () => 'Token Symbol',
    ja: () => 'トークンシンボル',
  },
  TokenSymbolHelper: {
    en: () => 'The abbrevation of the token. Example: UNI.',
    ja: () => 'トークンの略語。例: UNI。',
  },
} satisfies ClubsI18nParts
