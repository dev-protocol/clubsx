import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  SignToUseThisBenefit: {
    en: 'Sign to use this benefit',
    ja: 'サインして使う',
  },
  UsageStart: {
    en: ([time]) => `This benefit will no longer be activated after ${time}.`,
    ja: ([time]) => `この特典は、${time} 以降は有効化できなくなります。`,
  },
  AvailableUntil: {
    en: ([time]) => `Available until ${time}`,
    ja: ([time]) => `${time} まで有効`,
  },
  WillBeAvailableWhenXIsUsed: {
    en: ([dep]) => `Will be available when ${dep} is used.`,
    ja: ([dep]) => `${dep} を利用しているあいだ使用できます`,
  },
  WillBeAvailable: {
    en: ([time]) => `Will be available ${time}.`,
    ja: ([time]) => `${time} に有効になります`,
  },
  ModalMessageTicketConfirm: {
    en: ([start, end, exp]) =>
      `If you activate the benefit now, you will initially be able to use it from ${start} until ${end}. The expiry date is ${exp}. Are you sure you want to activate this?`,
    ja: ([start, end, exp]) =>
      `表示すると初回は ${start} から ${end} まで利用できます。有効期限は ${exp} です。本当に有効にしますか?`,
  },
  ModalCloseTicketConfirm: {
    en: 'Close',
    ja: '閉じる',
  },
  ModalActionTicketConfirm: {
    en: 'Yes',
    ja: 'はい',
  },
  BecomeMemberGetTickets: {
    en: 'Become a member and get tickets!',
    ja: 'チケットを所持していません',
  },
  BackToHomepage: {
    en: 'Take me back to the homepage',
    ja: 'トップページに戻る',
  },
  ModalMessageNotConnected: {
    en: 'Please connect a wallet first',
    ja: 'ウォレットに接続してください',
  },
  ModalCloseNotConnected: {
    en: 'OK',
    ja: 'わかりました',
  },
  Expiration: {
    en: ([time]) => `Expiration date is ${time}.`,
    ja: ([time]) => `有効期限: ${time}`,
  },
  ModalMessageNotSigned: {
    en: `Can't sign with your wallet? Close this confirmation, and disconnect/reconnect your wallet and try again.`,
    ja: 'ウォレットで署名ができませんか? この確認を閉じてからウォレットを再接続してもう一度試してください。',
  },
  Expired: {
    en: 'Expired',
    ja: '期限切れ',
  },
  UseThis: {
    en: 'Use this',
    ja: '使用する',
  },
  Available: {
    en: 'Available',
    ja: '使用済',
  },
  NowUnavailable: {
    en: 'Now Unavailable',
    ja: `現在は利用できません`,
  },
  AchievementMetadataAttributes: {
    en: ([txt]) => {
      if (txt === 'チケットの種類') {
        return 'Achievement Type'
      } else if (txt === '完了日') {
        return 'Completion Confirmation Date'
      } else if (txt === '報告日') {
        return 'Completion Report Date'
      } else if (txt === '案件番号') {
        return 'Requester'
      } else if (txt === '案件番号') {
        return 'Case Number'
      } else if (txt === '金額') {
        return 'Reward'
      } else if (txt === '通貨') {
        return 'Currency'
      } else {
        return txt || ''
      }
    },

    ja: ([txt]) => {
      const loweredCaseTxt = txt?.toLowerCase()
      if (loweredCaseTxt === 'Achievement Type'.toLowerCase()) {
        return 'チケットの種類'
      } else if (
        loweredCaseTxt === 'Completion Confirmation Date'.toLowerCase()
      ) {
        return '完了日'
      } else if (loweredCaseTxt === 'Completion Report Date'.toLowerCase()) {
        return '報告日'
      } else if (loweredCaseTxt === 'Requester'.toLowerCase()) {
        return '案件番号'
      } else if (loweredCaseTxt === 'Case Number'.toLowerCase()) {
        return '案件番号'
      } else if (loweredCaseTxt === 'Currency'.toLowerCase()) {
        return '通貨'
      } else if (
        loweredCaseTxt === 'Reward'.toLowerCase() ||
        loweredCaseTxt === 'Rewards'.toLowerCase()
      ) {
        return '金額'
      } else {
        return txt || ''
      }
    },
  },
} satisfies ClubsI18nParts
