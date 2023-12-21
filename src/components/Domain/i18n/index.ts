import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  Header: {
    en: () => 'It All Starts with a Domain',
    ja: () => 'ドメインから全ては始まります',
  },
  SubHeader: {
    en: () => 'You can use your preferred domain for your club.',
    ja: () => '好きなドメインをClubsで使用することができます',
  },
  DomainAvailable: {
    en: () => 'Domain available',
    ja: () => '利用可能なドメイン',
  },
  DomainUnavailable: {
    en: () => 'Domain unavailable',
    ja: () => '利用できないドメイン',
  },
  Continue: {
    en: () => 'Continue',
    ja: () => '続ける',
  },
} satisfies ClubsI18nParts
