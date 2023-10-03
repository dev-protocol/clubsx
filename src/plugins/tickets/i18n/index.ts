import type { ClubsI18nLocale } from '@devprotocol/clubs-core'

export enum Parts {
  SignToUseThisBenefit = ';1',
  AfterSigningThisWillBeAvailable = ';2',
  AvailableUntil = ';3',
  WillBeAvailableWhenXIsUsed = ';4',
  WillBeAvailable = ';5',
  ModalMessageTicketConfirm = ';6',
  ModalCloseTicketConfirm = ';7',
  ModalActionTicketConfirm = ';8',
  ModalMessageNotConnected = ';9',
  ModalCloseNotConnected = ';10',
}

export const Strings: Record<Parts, ClubsI18nLocale> = {
  [Parts.SignToUseThisBenefit]: {
    en: 'Sign to use this benefit',
    ja: 'サインして使う',
  },
  [Parts.AfterSigningThisWillBeAvailable]: {
    en: ([time]) => `After signing, this will be available ${time}`,
    ja: ([time]) => `サインすると ${time} から使用できます`,
  },
  [Parts.AvailableUntil]: {
    en: ([time]) => `Available until ${time}`,
    ja: ([time]) => `${time} まで有効`,
  },
  [Parts.WillBeAvailableWhenXIsUsed]: {
    en: ([dep]) => `Will be available when ${dep} is used.`,
    ja: ([dep]) => `${dep} を利用しているあいだ使用できます`,
  },
  [Parts.WillBeAvailable]: {
    en: ([time]) => `Will be available ${time}.`,
    ja: ([time]) => `${time} に有効になります`,
  },
  [Parts.ModalMessageTicketConfirm]: {
    en: ([start, end, exp]) =>
      `If you activate the benefit now, you will initially be able to use it from ${start} until ${end}. The expiry date is ${exp}. Are you sure you want to activate this?`,
    ja: ([start, end, exp]) =>
      `有効にすると初回は ${start} から ${end} まで利用できます。有効期限は ${exp} です。本当に有効にしますか?`,
  },
  [Parts.ModalCloseTicketConfirm]: {
    en: 'Close',
    ja: '閉じる',
  },
  [Parts.ModalActionTicketConfirm]: {
    en: 'Yes',
    ja: 'はい',
  },
  [Parts.ModalMessageNotConnected]: {
    en: 'Please connect a wallet first',
    ja: 'ウォレットに接続してください',
  },
  [Parts.ModalCloseNotConnected]: {
    en: 'OK',
    ja: 'わかりました',
  },
}
