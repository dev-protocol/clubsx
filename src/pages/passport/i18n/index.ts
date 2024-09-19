import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  ConnectWalletTryAgain: {
    en: () => `Connect wallet & try again!`,
    ja: () => `ウォレットを接続してもう一度お試しください`,
  },
  PurchasePassportSkin: {
    en: () =>
      `You have not purchased <b>Passport Skins</b>.<br /><i>To configure</i> your creative and unique passport page <b>purchase Passport Skins now</b>.`,
    ja: () =>
      `<b>パスポートスキン</b>を購入していません。<br />クリエイティブでユニークなパスポートページを<i>設定</i>するには、<b>今すぐパスポートスキンを購入</b>してください。`,
  },
  PinnPassportItems: {
    en: () =>
      `You have not purchased <b>Passport Assets</b>.<br /><i>To configure</i> your creative and unique passport page <b>purchase Passport Assets now</b>.`,
    ja: () =>
      `<b>パスポートアセット</b>を購入していません。<br />クリエイティブでユニークなパスポートページを<i>設定</i>するには、<b>今すぐパスポートアセットを購入</b>してください。`,
  },
  PurchasePassportAssets: {
    en: () =>
      `You have not <b>pinned your Passport Assets</b>.<br /><i>To configure</i> your creative and unique passport page <b>pin</b> them or <b>purchase passport assets if you do not already have them</b>.`,
    ja: () =>
      `パスポートアセットを<b>ピン留め</b>していません。<br />クリエイティブでユニークなパスポートページを<i>設定</i>するには、パスポートアセットを<b>ピン留め</b>するか、<b>まだお持ちでない場合はパスポートアセットを購入してください。</b>。`,
  },
  PassportAssets: {
    en: () => `Passport Assets`,
    ja: () => `パスポートアセット`,
  },
  PassportSkin: {
    en: 'Passport Skin',
    ja: 'パスポートスキン',
  },
  SelectedPassportClips: {
    en: 'Selected Passport Clips- Pinned passport assets',
    ja: '選択されたパスポートクリップ - ピン留めされたパスポートアセット',
  },
  Profile: {
    en: 'Profile',
    ja: 'プロフィール',
  },
  Avatar: {
    en: 'Avatar',
    ja: 'プロフィール画像',
  },
  Username: {
    en: 'Username',
    ja: 'ユーザー名',
  },
  Description: {
    en: 'Description',
    ja: '説明',
  },
  MarkdownAvailable: {
    en: () => 'Markdown is available',
    ja: () => 'マークダウンが利用可能',
  },
  WhatIsMarkdown: {
    en: () => 'What is Markdown?',
    ja: () => 'マークダウンとは',
  },
  Save: {
    en: 'Save',
    ja: '保存',
  },
  Saved: {
    en: 'Saved',
    ja: '保存しました',
  },
  Error: {
    en: 'Error',
    ja: 'エラー',
  },
  Achievements: {
    en: 'Achievements',
    ja: 'アチーブメント',
  },
  Clubs: {
    en: `Clubs`,
    ja: `Clubs`,
  },
  Empty: {
    en: `Empty`,
    ja: `まだありません`,
  },
  Edit: {
    en: 'Edit',
    ja: '編集',
  },
  Manage: {
    en: 'Manage',
    ja: '管理',
  },
  ClubPage: {
    en: 'Club page',
    ja: 'クラブページ',
  },
  Published: {
    en: 'Published',
    ja: '公開済み',
  },
  PublishDraftClubs: {
    en: 'No published clubs found. You have clubs in drafting phase. Publish them to unlock their full potential and make them accessible.',
    ja: '公開済みのクラブは見つかりませんでした。作成中のクラブを公開して、他のユーザーがアクセスできるようにしましょう',
  },
  NoClubFound: {
    en: 'No clubs found.',
    ja: 'クラブが見つかりませんでした',
  },
  Draft: {
    en: 'Draft',
    ja: '作成中のクラブ',
  },
  NoDraftClub: {
    en: 'No draft clubs found. Create clubs now',
    ja: '作成中のクラブが見つかりませんでした。クラブを作成してください',
  },
  NoDraftClubFound: {
    en: 'No draft clubs found.',
    ja: '作成中のクラブが見つかりませんでした',
  },
  CreateClubsNow: {
    en: 'Create clubs now',
    ja: 'クラブを作成する',
  },
} satisfies ClubsI18nParts
