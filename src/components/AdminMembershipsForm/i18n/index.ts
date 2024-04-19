import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  Creator: {
    en: () => 'Creator',
    ja: () => 'クリエイター',
  },
  CreatorDescription: {
    en: () =>
      'Start a subscription for your lessons, contents, experiences, and more.',
    ja: () => '授業、コンテンツ、体験のサブスクリプション向けのメンバーシップ',
  },
  CreatorExampleName: {
    en: () => 'Example: Dev Protocol',
    ja: () => 'My Vlog',
  },
  Business: {
    en: () => 'Business',
    ja: () => 'ビジネス',
  },
  BusinessDescription: {
    en: () => 'Provide special offers to members/non-members.',
    ja: () => '会員/非会員に特別なオファーを提供するメンバーシップ',
  },
  BusinessExampleName: {
    en: () => 'Clubs Hotel',
    ja: () => 'Clubsホテル',
  },
  Public: {
    en: () => 'Public',
    ja: () => 'パブリック',
  },
  Private: {
    en: () => 'Private',
    ja: () => 'プライベート',
  },
  PublicDescription: {
    en: () => 'Start a co-creation project and invite members.',
    ja: () => '共同プロジェクトのメンバー募集のためのメンバーシップ',
  },
  PublicExampleName: {
    en: () => 'Public Project',
    ja: () => '公共プロジェクト',
  },
  Select: {
    en: () => 'Select',
    ja: () => '選択する',
  },
  Example: {
    en: () => 'Example',
    ja: () => '例',
  },
  ExistingMemberships: {
    en: () => 'Existing Memberships',
    ja: () => '既存のメンバーシップ',
  },
  Delete: {
    en: () => 'Delete',
    ja: () => '非表示にする',
  },
  Activate: {
    en: () => 'Activate',
    ja: () => '表示する',
  },
  Cancel: {
    en: () => 'Cancel',
    ja: () => 'キャンセル',
  },
  MaximumPrice: {
    en: () => 'Minimum price allowed is',
    ja: () => '',
  },
  MinimumFee: {
    en: () => 'Minimum earning model fee allowed is',
    ja: () => '',
  },
  PriceSetMin: {
    en: () => 'Price automatically set to minimum allowed value',
    ja: () => '',
  },
  PriceSetMax: {
    en: () => 'Price automatically set to maximum allowed value',
    ja: () => '',
  },
  FeeSetMin: {
    en: () => 'Fee automatically set to minimum allowed value',
    ja: () => '',
  },
  FeeSetMax: {
    en: () => 'Fee automatically set to maximum allowed value',
    ja: () => '',
  },
  MembershipInUse: {
    en: (noOfPositions) =>
      `This membership already has ${noOfPositions} members.`,
    ja: (noOfPositions) =>
      `このメンバーシップにはすでに${noOfPositions}人のメンバーがいます。`,
  },
  Image: {
    en: () => 'Image',
    ja: () => '画像',
  },
  UploadToChangeImage: {
    en: () => 'Upload to change image',
    ja: () => '画像を変更するにはアップロードしてください',
  },
  RecommendedImageSize: {
    en: () => 'Recommended image size is 600 x 600 px',
    ja: () => '推奨画像サイズ: 600 x 600 px',
  },
  UseGoogleSlidesTemplate: {
    en: () => 'Use Google Slides Template',
    ja: () => 'Googleスライドテンプレートを使用',
  },
  Price: {
    en: () => 'Price',
    ja: () => '価格',
  },
  Priced: {
    en: () => 'Priced',
    ja: () => '',
  },
  Unpriced: {
    en: () => 'Unpriced',
    ja: () => '',
  },
  // note to Kent:
  // These two form one sentence, but are separated for HTML styling purposes
  UnpricedCannotBeBought: {
    en: () => 'Unpriced memberships cannot be bought,',
    ja: () => '',
  },
  AvailableInviteOnly: {
    en: () => 'they are available via invite only.',
    ja: () => '利用可能（招待のみ）',
  },
  // note to Kent:
  // These two form one sentence, but are separated for HTML styling purposes
  ChoosingUSDC: {
    en: () => 'If you choose USDC, you can activate ',
    ja: () => '',
  },
  CreditCardPlugin: {
    en: () => 'the credit card plugin.',
    ja: () => '',
  },
  EarningModel: {
    en: () => 'Earning Model',
    ja: () => '収益モデル',
  },
  DEVEarningModelDisabled: {
    en: () => 'Earning model option is currently disabled for DEV',
    ja: () => '',
  },
  WhatIsStaking: {
    en: () => 'What is staking?',
    ja: () => 'ステーキングとは？',
  },
  Description: {
    en: () => 'Description',
    ja: () => '説明',
  },
  MarkdownAvailable: {
    en: () => 'Markdown is available',
    ja: () => 'Markdownが利用可能',
  },
  WhatIsMarkdown: {
    en: () => 'What is Markdown?',
    ja: () => 'Markdownとは？',
  },
  Payload: {
    en: () => 'Payload',
    ja: () => 'ペイロード',
  },
  AccessControl: {
    en: () => 'Access Control',
    ja: () => 'アクセス制御',
  },
  AccessControlURL: {
    en: () => 'Access Control URL',
    ja: () => 'アクセス制御URL',
  },
  DescriptionOfVerification: {
    en: () => 'Description of the verification process',
    ja: () => '認証の説明',
  },
  WillEarnAtOnce: {
    // For example: "X USDC will be earned at 1 time"
    en: () => 'will be earned at 1 time.',
    ja: () => '',
  },
  WillBeStaked: {
    // For example: "X USDC will will be staked to earn dev continuously."
    en: () => 'will be staked to earn dev continuously.',
    ja: () => '',
  },
} satisfies ClubsI18nParts
