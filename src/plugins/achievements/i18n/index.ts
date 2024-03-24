import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  TxErrorMsg: {
    en: 'Error occured, try agian or contact support.',
    ja: 'エラーが発生しました。agian を試すか、サポートにお問い合わせください。',
  },
  TxSigRejected: {
    en: 'Wallet signature rejected, try again.',
    ja: 'ウォレットの署名が拒否されました。もう一度お試しください。',
  },
  CantClaimMsg: {
    en: `Looks like you can't claim this achievement.`,
    ja: `この実績は申請できないようです。`,
  },
  SignTxMsg: {
    en: 'Sign to claim the achievement.',
    ja: '成果を主張するために署名します。',
  },
  AlreadyClaimed: {
    en: 'Achievement is already claimed.',
    ja: '成果はすでに主張されています。',
  },
  Claiming: {
    en: 'Claiming',
    ja: '主張する',
  },
  Claimed: {
    en: 'Claimed',
    ja: '主張した',
  },
  Claim: {
    en: 'Claim',
    ja: '請求',
  },
  Achievement: {
    en: 'Achievement',
    ja: '成果',
  },
  AchievementDataNotFound: {
    en: 'We could not find the Achievement, try again or contact the team for support.',
    ja: '実績が見つかりませんでした。再試行するか、チームに連絡してサポートを求めてください。',
  },
  SignInMsg: {
    en: 'Please sign in.',
    ja: 'サインインしてください。',
  },
} satisfies ClubsI18nParts
