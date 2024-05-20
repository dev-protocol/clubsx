import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  SelectMembership: {
    en: 'Select a membership',
    ja: 'メンバーシップを選択してください',
  },
  BecomeMember: {
    en: 'Become a member',
    ja: '会員になる',
  },
  WaitForLaunch: {
    en: 'Please wait for the launch',
    ja: '発売までお待ちください',
  },
  About: {
    en: ([name]) => `About ${name}`,
    ja: ([name]) => `${name} について`,
  },
} satisfies ClubsI18nParts
