import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  SelectMembership: {
    en: 'Select a membership',
    ja: 'メンバーシップを選択してください',
  },
  BecomeMember: {
    en: 'Become a member',
    ja: 'メンバーになる',
  },
  WaitForLaunch: {
    en: 'Please wait for the launch',
    ja: 'ローンチまでお待ちください',
  },
  About: {
    en: ([name]) => `About ${name}`,
    ja: ([name]) => `${name} について`,
  },
} satisfies ClubsI18nParts
