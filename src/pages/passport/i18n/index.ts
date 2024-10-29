import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  PassportName: {
    en: 'Passport name',
    ja: `パスポート名`,
  },
  FrameColor: {
    en: `Frame color`,
    ja: `フレームカラー`,
  },
  EditItem: {
    en: `Edit item`,
    ja: `項目を編集する`,
  },
  SNSPlaceholder: {
    en: ([sns]) => `Enter your ${sns} username.`,
    ja: ([sns]) => `${sns}のユーザー名を入力します。`,
  },
  DescriptionPlaceholder: {
    en: `Describe yourself here.`,
    ja: `ここに自分自身について説明してください。`,
  },
  PassportSkinNamePlaceholder: {
    en: `Enter a name that you would like to give to this passport`,
    ja: `このパスポートに付けたい名前を入力してください`,
  },
  UsernamePlaceholder: {
    en: `Enter your username.`,
    ja: `ユーザー名を入力してください。`,
  },
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
  PinClipsToShowcase: {
    en: () =>
      `You have not pinned your <b>Passport Clips</b>.<br /><i>To configure</i> your creative and unique passport page <b>pin Passport Clips now</b>.`,
    ja: () =>
      `<b>パスポート クリップ</b> を固定していません。<br /><i>クリエイティブでユニークなパスポート ページを設定</i>するには、<b>今すぐパスポート クリップを固定</b>してください。`,
  },
  PinClipsToSpotlight: {
    en: () =>
      `You have not pinned your <b>Passport Clips</b> to spotlight.<br /><i>To configure</i> your creative and unique passport page <b>pin Passport Clips to Spotlight now</b>.`,
    ja: () =>
      `<b>パスポート クリップ</b> をスポットライトに固定していません。<br /><i>クリエイティブでユニークなパスポート ページを設定</i>するには、<b>今すぐパスポート クリップをスポットライトに固定</b>してください。`,
  },
  PinClipsToSpotlightHelper: {
    en: () => `<b>NOTE</b>: You can pin 3 clips to your spotlight.`,
    ja: () =>
      `<b>注</b>: スポットライトには 3 つのクリップをピン留めできます。`,
  },
  PurchasePassportClips: {
    en: () =>
      `You have not purchased <b>Passport Assets</b>.<br /><i>To configure</i> your creative and unique passport page <b>purchase Passport Assets now</b>.`,
    ja: () =>
      `<b>パスポート アセット</b>を購入していません。<br />クリエイティブでユニークなパスポート ページを<i>設定</i>するには、<b>今すぐパスポート アセットを購入</b>してください。`,
  },
  PassportClips: {
    en: () => `Purchased Passport Clips`,
    ja: () => `パスポートアセット`,
  },
  PassportSkin: {
    en: 'Purchased Passport Skins',
    ja: 'パスポートスキン',
  },
  PassportShowcaseClips: {
    en: 'Showcase Clips',
    ja: '固定されたクリップ',
  },
  PassportSpotlightClips: {
    en: 'Spotlight Clips',
    ja: 'スポットライトクリップ',
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
  PassportNameHelper: {
    en: 'Give a name to your passport to make it easy to distinguish them',
    ja: 'パスポートに名前を付けて区別しやすくする',
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
