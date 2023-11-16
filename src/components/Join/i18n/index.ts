import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  Join: {
    en: 'Join',
    ja: '',
  },
  JoinTenant: {
    en: ([tenant]) => `Join ${tenant} in support of their project.`,
    ja: ([amount]) => ``,
  },
  SustainableStaking: {
    en: 'The best way to sustainably support projects through staking.',
    ja: '',
  },
  Earn: {
    en: 'You will earn $DEV by staking.',
    ja: '',
  },
  SelectMembership: {
    en: 'Select a membership',
    ja: '',
  },
  PurchaseWith: {
    en: 'Purchase with',
    ja: '',
  },
  SelectTier: {
    en: 'Select a tier',
    ja: '',
  },
} satisfies ClubsI18nParts
