import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  Loading: {
    en: 'Loading...',
    ja: '読み込み中...',
  },
  SignInMsg: {
    en: 'Please sign in.',
    ja: 'サインインしてください',
  },
  SignInToClaimMembership: {
    en: 'Sign to claim your membership.',
    ja: '上のボタンをクリックしてメンバーシップを取得してください',
  },
  InvitationClaimed: {
    en: 'Invitation claimed.',
    ja: '招待を受けたメンバーシップを取得しました',
  },
  FailedToCheckAvailability: {
    en: 'Failed to check availability',
    ja: '空き状況の確認に失敗しました',
  },
  FailedToClaimInvitation: {
    en: 'Failed to claim invitation',
    ja: '招待を受けたメンバーシップを取得できませんでした',
  },
  ClaimBtnTxt: {
    en: 'Claim',
    ja: '報酬を取得する',
  },
  ClaimingBtnTxt: {
    en: 'Claiming',
    ja: '取得中',
  },
} satisfies ClubsI18nParts
