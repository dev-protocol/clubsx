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
      `有効にすると初回は ${start} から ${end} まで利用できます。有効期限は ${exp} です。本当に有効にしますか?`,
  },
  ModalCloseTicketConfirm: {
    en: 'Close',
    ja: '閉じる',
  },
  ModalActionTicketConfirm: {
    en: 'Yes',
    ja: 'はい',
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
} satisfies ClubsI18nParts
