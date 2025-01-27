import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  Done: {
    en: `Done`,
    ja: `完了`,
  },
  Unlist: {
    en: `Unlist`,
    ja: `非表示`,
  },
  EditItemComment: {
    en: `Comment`,
    ja: `コメント`,
  },
  InputYourCommentHere: {
    en: `Input your comment here`,
    ja: `コメントを入力してください`,
  },
  HideProfile: {
    en: `Archive`,
    ja: `アーカイブする`,
  },
  ShowProfile: {
    en: `Unarchive`,
    ja: `アーカイブから戻す`,
  },
  MakeDefaultProfile: {
    en: `Make this Passport default`,
    ja: `このパスポートをデフォルトにする`,
  },
  AddNewProfile: {
    en: `Add new Passport`,
    ja: `新しいパスポートを追加`,
  },
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
    ja: `アイテムを編集する`,
  },
  SNSPlaceholder: {
    en: ([sns]) => `Enter your ${sns} username.`,
    ja: ([sns]) => `${sns}のユーザー名を入力してください。`,
  },
  DescriptionPlaceholder: {
    en: `Describe yourself here.`,
    ja: `自己紹介を入力してください`,
  },
  PassportSkinNamePlaceholder: {
    en: `Enter a name that you would like to give to this passport`,
    ja: `パスポートの名称を入力してください`,
  },
  UsernamePlaceholder: {
    en: `Enter your username.`,
    ja: `ユーザー名を入力してください。`,
  },
  ConnectWalletTryAgain: {
    en: () => `Connect wallet & try again!`,
    ja: () => `ウォレットを接続してもう一度試してください`,
  },
  PurchasePassportSkin: {
    en: () =>
      `You have not purchased <b>Passport Skins</b>.<br /><i>To configure</i> your creative and unique passport page <b>purchase Passport Skins now</b>.`,
    ja: () =>
      `<b>パスポートスキン</b>を購入していません。<br />パスポートスキンを<i>購入</i>すると、<b>パスポートページで着せ替え</b>をすることができます。`,
  },
  PinClipsToShowcase: {
    en: () =>
      `You have not posted your <b>Passport Clips</b>.<br /><i>To configure</i> your creative and unique passport page <b>post Passport Clips now</b>.`,
    ja: () =>
      `<b>パスポートクリップ</b> を投稿していません。<br /><i>パスポートページを設定</i>するには、<b>今すぐパスポートクリップを投稿</b>してください。`,
  },
  PinClipsToSpotlight: {
    en: () =>
      `You have not posted your <b>Passport Clips</b> to spotlight.<br /><i>To configure</i> your creative and unique passport page <b>post Passport Clips to Spotlight now</b>.`,
    ja: () =>
      `<b>パスポートクリップ</b> をスポットライトに投稿していません。<br /><i>パスポートページを設定</i>するには、<b>今すぐパスポートクリップをスポットライトに投稿</b>してください。`,
  },
  PinClipsToSpotlightHelper: {
    en: () => `You can post 3 clips to your spotlight.`,
    ja: () => `スポットライトには3つのクリップを投稿できます。`,
  },
  PinClipsToShowcaseHelper: {
    en: () => `You can post as many clips as you like to your showcase.`,
    ja: () => `ショーケースには好きな数のクリップを投稿できます。`,
  },
  PurchasePassportClips: {
    en: () =>
      `You have not purchased <b>Passport Assets</b>.<br /><i>To configure</i> your creative and unique passport page <b>purchase Passport Assets now</b>.`,
    ja: () =>
      `<b>パスポートアセット</b>を購入していません。<br />パスポートページを<i>設定</i>するには、<b>今すぐパスポートアセットを購入</b>してください。`,
  },
  PassportClips: {
    en: () => `Purchased Passport Clips`,
    ja: () => `購入済みのパスポートクリップ`,
  },
  PassportSkin: {
    en: 'Purchased Passport Skins',
    ja: '購入済みのパスポートスキン',
  },
  PassportShowcaseClips: {
    en: 'Showcase Clips',
    ja: 'ショーケースクリップ',
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
    ja: '自己紹介',
  },
  PassportNameHelper: {
    en: 'Give a name to your passport to make it easy to distinguish them',
    ja: 'パスポートに名前を付けると区別がしやすくなります',
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
  Saving: {
    en: 'Saving',
    ja: '保存中',
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
  ContentLink: {
    en: 'Content link',
    ja: 'リンク',
  },
  ContentLinkPlaceholder: {
    en: 'TikTok, YouTube, YouTube Shorts, Pinterest, Instagram, X are available.',
    ja: 'TikTok, YouTube, YouTube Shorts, Pinterest, Instagram, X のリンクが利用可能です。',
  },
  ContentLinkDescriptionPlaceholder: {
    en: 'Your comment...',
    ja: 'コメント',
  },
  AddFromExternal: {
    en: 'Add link from',
    ja: 'リンクを追加',
  },
  HasNoAccess: {
    en: `You can't access here.`,
    ja: 'ここにはアクセスできません。',
  },
  SignIn: {
    en: 'Sign In',
    ja: 'サインイン',
  },
  SignInOrSignUp: {
    en: 'Sign In/Register',
    ja: 'ログイン/会員登録',
  },
  Close: {
    en: 'Close',
    ja: '閉じる',
  },
  PassportUpdated: {
    en: 'Your Passport has been updated!',
    ja: 'パスポートを更新しました!',
  },
  PreviewMyPassport: {
    en: 'Preview my Passport',
    ja: 'パスポートを見る',
  },
  Skin: {
    en: 'Skin',
    ja: 'スキン',
  },
  CustomSkinSet: {
    en: 'Custom Skin is set.',
    ja: 'カスタムスキンあり',
  },
  NoCustomSkinSet: {
    en: 'Custom Skin is not set.',
    ja: 'カスタムスキンなし',
  },
  StartCustomization: {
    en: `Welcome! Let's create your passport now!`,
    ja: `ようこそ！いまからあなたのパスポートを作成しましょう！`,
  },
  Start: {
    en: `Start`,
    ja: `はじめる`,
  },
  YourName: {
    en: `What's your name?`,
    ja: `お名前は?`,
  },
  FaveCharacterss: {
    en: `What's your fave?`,
    ja: `あなたの推しは?`,
  },
  FaveCharactersExample: {
    en: `Please write the name(s) of your fave anime, game, manga, character, etc.`,
    ja: `推しのアニメやゲーム、マンガ、キャラクターなどの名前を教えてください。`,
  },
  Next: {
    en: `Next`,
    ja: `進む`,
  },
  Finish: {
    en: `Finish`,
    ja: `完了`,
  },
  CreatePassport: {
    en: `Create the first Passport`,
    ja: `最初のパスポートをつくる`,
  },
  PassportCreated: {
    en: `Created!`,
    ja: `完成しました!`,
  },
  AfterPassportCreated: {
    en: `Enhance your Passport by showcasing videos, photos, and writing a self-introduction. You can display content from TikTok, YouTube, Instagram, and X, or arrange clips you've purchased.`,
    ja: `動画や写真を飾ったり、自己紹介を書いてパスポートを充実させてみましょう。TikTok, YouTube, Instagram や X のコンテンツを飾ったり、購入したクリップを並べることができます。`,
  },
  NoPurchasedItem: {
    en: `Purchased items will be added here`,
    ja: `購入アイテムはここに追加されます`,
  },
  Post: {
    en: `Post`,
    ja: `投稿`,
  },
  Tags: {
    en: `Tags`,
    ja: `タグ`,
  },
  Collect: { en: `Collect`, ja: `集めて` },
  Showcase: { en: `Showcase`, ja: `飾って` },
  Connect: { en: `Connect`, ja: `つながろう` },
  ',': { en: `,`, ja: `、` },
  '.': { en: `.`, ja: `。` },
  And: { en: `and `, ja: `` },
  CopyLine: {
    en: `CLUBS lets you collect and showcase your favorite game and anime items—fandom, right in your pocket.`,
    ja: `CLUBS（クラブス）は、好きなゲームやアニメのアイテムを集めて飾れる、新しいコレクション型SNSです。ポケットに入るデジタル推し活を楽しもう！`,
  },
  UseAsAGuest: {
    en: 'Use as a guest',
    ja: 'ゲストとして使う',
  },
} satisfies ClubsI18nParts
