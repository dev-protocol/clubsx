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
  TokenizeModeLabel: {
    en: ([mode]) => {
      if (mode === 'create') {
        return `Import my token instead`
      }

      return `Create new token`
    },
    ja: ([mode]) => {
      if (mode === 'create') {
        return `トークンをインポートする`
      }

      return `新規作成する`
    },
  },
  TokenizeModeInValidAddrHelper: {
    en: () =>
      `The entered address is invalid or doesn't exist on the blockchain.`,
    ja: () =>
      `入力されたアドレスは無効であるか、ブロックチェーン上に存在しません。`,
  },
  TokenizeModeInValidPropertyAddrHelper: {
    en: () =>
      `The entered address is either not deployed by using DEV Protocol (Niwa or Stakes Social) or doesn't exist on the blockchain.`,
    ja: () =>
      `入力されたアドレスは、DEV プロトコル (Niwa または Stakes Social) を使用してデプロイされていないか、ブロックチェーン上に存在しません。`,
  },
  TokenizeModeNotOwnerHelper: {
    en: () =>
      `You are not the author (owner or creator) of the entered token address.`,
    ja: () =>
      `あなたは、入力されたトークン アドレスの作成者 (所有者または作成者) ではありません。`,
  },
  VerifyYouLabel: {
    en: () => `How can we verify it's you?`,
    ja: () => `本人確認はどうすればできますか？`,
  },
  VerifiedYouHelper: {
    en: ([market, assetName]) => {
      if (!market || !assetName)
        return `* Add your socials so fans know it’s you!`
      return `* <b>${market}</b> - ${assetName}`
    },
    ja: ([market, assetName]) => {
      if (!market || !assetName)
        return '* ソーシャルを追加して、ファンにあなたであることを知らせましょう。'
      return `* <b>${market}</b> - 認証された${assetName}`
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
  TokenSupply: {
    en: () => `will be created.`,
    ja: () => `が作成されます。`,
  },
  Next: {
    en: () => 'Next',
    ja: () => `次`,
  },
  CreateASig: {
    en: () => `Create a signature`,
    ja: () => `署名を作成する`,
  },
  Sign: {
    en: () => `Sign`,
    ja: () => `サイン`,
  },
  Tokenize: {
    en: () => `Tokenize`,
    ja: () => `トークン化`,
  },
  StartClub: {
    en: () => `Create a token and start your club`,
    ja: () => `トークンを作成してクラブを開始する`,
  },
} satisfies ClubsI18nParts
