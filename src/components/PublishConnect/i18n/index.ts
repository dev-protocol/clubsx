import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  Connect: {
    en: () => 'Connect',
    ja: () => '接続',
  },
  Connected: {
    en: () => 'Connected',
    ja: () => '接続済み',
  },
  ConnectYourWallet: {
    en: () => 'Connect your wallet',
    ja: () => 'ウォレットを接続する',
  },
  FetchingWalletDetails: {
    en: () => 'Fetching wallet details...',
    ja: () => 'ウォレットを読み込んでいます',
  },
} satisfies ClubsI18nParts
