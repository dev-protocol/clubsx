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
  StartClub: {
    en: () => `Create a token and start your club`,
    ja: () => `トークンを作成してクラブを開始する`,
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
  Signing: {
    en: () => 'Signing',
    ja: () => `署名`,
  },
  Signed: {
    en: () => `Signed`,
    ja: () => `署名済み`,
  },
  SignError: {
    en: () => `Error signing, try again!`,
    ja: () => `署名エラー。もう一度試してください。`,
  },
  Tokenize: {
    en: () => `Tokenize`,
    ja: () => `トークン化`,
  },
  Tokenizing: {
    en: () => `Tokenizing`,
    ja: () => `トークン化`,
  },
  Tokenized: {
    en: () => `Tokenized`,
    ja: () => `トークン化`,
  },
  TokenizeError: {
    en: () => 'Error tokenizing, try again!',
    ja: () => `トークン化エラー。もう一度お試しください。`,
  },
  TxnRejected: {
    en: () => `Wallet signature rejected, try again.`,
    ja: () => `ウォレットの署名が拒否されました。もう一度お試しください`,
  },
  Publish: {
    en: () => 'Publish',
    ja: () => `公開`,
  },
  Publishing: {
    en: () => `Publishing`,
    ja: () => `出版`,
  },
  Published: {
    en: () => `Published`,
    ja: () => `発行済み`,
  },
  PublishError: {
    en: () => 'Error publishing, try again!',
    ja: () => `公開エラー。もう一度お試しください。`,
  },
  ConnectWallet: {
    en: () => `Connect wallet & try again!`,
    ja: () => `ウォレットを接続してもう一度お試しください!`,
  },
  ClubsNotInDraft: {
    en: () => `Club is already published`,
    ja: () => `クラブはすでに公開されています`,
  },
} satisfies ClubsI18nParts
