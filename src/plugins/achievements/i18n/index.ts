import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  ClaimSuccessFeedback: {
    en: 'Your achievement has been successfully claimed.',
    ja: '実績証明NFTの取得に成功しました',
  },
  YouAreNowHolding: {
    en: 'You are now holding',
    ja: '今回取得した実績証明NFT：',
  },
  Congratulations: {
    en: 'Congratulation!',
    ja: 'おめでとうございます！',
  },
  TxErrorMsg: {
    en: 'Error occured, try agian or contact support.',
    ja: 'エラーが発生しました。もう一度試すか、サポートにお問い合わせください',
  },
  TxSigRejected: {
    en: 'Wallet signature rejected, try again.',
    ja: 'ウォレットの署名が拒否されました。もう一度お試しください',
  },
  CantClaimMsg: {
    en: `Looks like you can't claim this achievement.`,
    ja: `この実績証明NFTを取得できないようです`,
  },
  ClickClaimMsg: {
    en: `Click "Claim" to claim your achievement`,
    ja: `上のボタンをクリックしてください`,
  },
  SignTxMsg: {
    en: 'Sign to claim the achievement.',
    ja: 'クリックして実績証明NFTを取得する',
  },
  AlreadyClaimed: {
    en: 'Achievement is already claimed.',
    ja: '取得済みの実績証明NFTです',
  },
  Claiming: {
    en: 'Claiming',
    ja: '取得中',
  },
  Claimed: {
    en: 'Claimed',
    ja: '取得済み',
  },
  Claim: {
    en: 'Claim',
    ja: '取得する',
  },
  Achievement: {
    en: 'Achievement',
    ja: '実績証明NFT',
  },
  AchievementDataNotFound: {
    en: 'We could not find the Achievement, try again or contact the team for support.',
    ja: '実績証明NFTが見つかりません。もう一度試すか、サポートにお問い合わせください',
  },
  SignInMsg: {
    en: 'Please sign in.',
    ja: 'サインインしてください',
  },
  ClaimBtnTxt: {
    en: 'Claim',
    ja: '報酬を取得する',
  },
  ClaimingBtnTxt: {
    en: 'Claiming',
    ja: '取得中',
  },
  AchievementMetadataAttributes: {
    en: ([txt]) => {
      if (txt === '完了確認日') {
        return 'Completion Confirmation Date'
      } else if (txt === '完了報告日') {
        return 'Completion Report Date'
      } else if (txt === '案件番号') {
        return 'Requester'
      } else if (txt === '案件番号') {
        return 'Case Number'
      } else if (txt === '報酬') {
        return 'Reward'
      } else if (txt === '単位') {
        return 'Currency'
      } else {
        return txt || ''
      }
    },
    ja: ([txt]) => {
      const loweredCaseTxt = txt?.toLowerCase()
      if (loweredCaseTxt === 'Completion Confirmation Date'.toLowerCase()) {
        return '完了確認日'
      } else if (loweredCaseTxt === 'Completion Report Date'.toLowerCase()) {
        return '完了報告日'
      } else if (loweredCaseTxt === 'Requester'.toLowerCase()) {
        return '案件番号'
      } else if (loweredCaseTxt === 'Case Number'.toLowerCase()) {
        return '案件番号'
      } else if (loweredCaseTxt === 'Currency'.toLowerCase()) {
        return '単位'
      } else if (
        loweredCaseTxt === 'Reward'.toLowerCase() ||
        loweredCaseTxt === 'Rewards'.toLowerCase()
      ) {
        return '報酬'
      } else {
        return txt || ''
      }
    },
  },
} satisfies ClubsI18nParts
