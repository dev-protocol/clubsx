import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  Header: {
    en: () => 'Publish',
    ja: () => '公開',
  },
  SubHeader: {
    en: () => '',
    ja: () => '',
  },
  ClubNameLabel: {
    en: () => 'Club Name',
    ja: () => 'クラブ名',
  },
  ClubNameHelper: {
    en: ([site]) => `The registered domain name of your clubs is ${site}.`,
    ja: ([site]) => `あなたのクラブの登録ドメイン名は ${site} です。`,
  },
  VerifyYouLabel: {
    en: () => `How can we verify it's you?`,
    ja: () => `本人確認はどうすればできますか？`,
  },
  VerifiedYouHelper: {
    en: ([platform]) => {
      if (!platform) return `* Add your socials so fans know it’s you!`
      return `<b>${platform}</b> - AUTHENTICATED_CHANNEL_ID`
    },
    ja: ([platform]) => {
      if (!platform)
        return '* ソーシャルを追加して、ファンにあなたであることを知らせましょう。'
      return `<b>${platform}</b> - 認証されたチャンネルID`
    },
  },
  TokenNameLabel: {
    en: () => 'Token Name',
    ja: () => 'トークン名',
  },
  TokenNameHelper: {
    en: () => 'The full name of the token. Example: Uniswap.',
    ja: () => 'トークンのフルネーム。例: Uniswap。',
  },
  TokenSymbolLabel: {
    en: () => 'Token Symbol',
    ja: () => 'トークンシンボル',
  },
  TokenSymbolHelper: {
    en: () => 'The abbrevation of the token. Example: UNI.',
    ja: () => 'トークンの略語。例: UNI。',
  },
} satisfies ClubsI18nParts
