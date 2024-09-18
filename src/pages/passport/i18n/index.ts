import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  ConnectWalletTryAgain: {
    en: () => `Connect wallet & try again!`,
    ja: () => `ウォレットを接続してもう一度お試しください!`,
  },
  PurchasePassportSkin: {
    en: () =>
      `You have not purchased <b>Passport Skins</b>.<br /><u>To configure</u> your creative and unique passport page <b>purchase Passport Skins now</b>.`,
    ja: () =>
      `<b>パスポート スキン</b>を購入していません。<br />クリエイティブでユニークなパスポート ページを<u>設定</u>するには、<b>今すぐパスポート スキンを購入</b>してください。`,
  },
  PinnPassportItems: {
    en: () =>
      `You have not purchased <b>Passport Assets</b>.<br /><u>To configure</u> your creative and unique passport page <b>purchase Passport Assets now</b>.`,
    ja: () =>
      `<b>パスポート アセット</b>を購入していません。<br />クリエイティブでユニークなパスポート ページを<u>設定</u>するには、<b>今すぐパスポート アセットを購入</b>してください。`,
  },
  PurchasePassportAssets: {
    en: () =>
      `You have not <b>pinned your Passport Assets</b>.<br /><u>To configure</u> your creative and unique passport page <b>pin</b> them or <b>purchase passport assets if you do not already have them</b>.`,
    ja: () =>
      `パスポート アセットを<b>固定</b>していません。<br />クリエイティブでユニークなパスポート ページを<u>設定</u>するには、パスポート アセットを<b>固定</b>するか、<b>パスポート アセットを購入してください。まだお持ちでない場合</b>。`,
  },
  PassportAssets: {
    en: () => `Passport Assets`,
    ja: () => `パスポート資産`,
  },
  PassportSkin: {
    en: 'Passport Skin',
    ja: 'パスポートスキン',
  },
  SelectedPassportClips: {
    en: 'Selected Passport Clips- Pinned passport assets',
    ja: '選択されたパスポート クリップ - ピン留めされたパスポート アセット',
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
    ja: '保存されました',
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
    ja: `Clubsのメンバーシップ`,
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
    ja: '発行済み',
  },
  PublishDraftClubs: {
    en: 'No published clubs found. You have clubs in drafting phase. Publish them to unlock their full potential and make them accessible.',
    ja: '公開されたクラブは見つかりませんでした。作成したクラブを公開して、他のユーザーがアクセスできるようにしましょう',
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
    ja: '今すぐクラブを作成する',
  },
} satisfies ClubsI18nParts
