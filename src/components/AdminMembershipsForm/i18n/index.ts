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
    ja: () => '例：DEVプロトコル',
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
    ja: () => '選択',
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
    ja: () => '許容されている最小価格',
  },
  MinimumFee: {
    en: () => 'Minimum earning model fee allowed is',
    ja: () => '許容されている最小の収益モデルの手数料',
  },
  PriceSetMin: {
    en: () => 'Price automatically set to minimum allowed value',
    ja: () => '価格は最小許容値に自動で設定されます',
  },
  PriceSetMax: {
    en: () => 'Price automatically set to maximum allowed value',
    ja: () => '価格は最大許容値に自動で設定されます',
  },
  FeeSetMin: {
    en: () => 'Fee automatically set to minimum allowed value',
    ja: () => '手数料は最小許容値に自動で設定されます',
  },
  FeeSetMax: {
    en: () => 'Fee automatically set to maximum allowed value',
    ja: () => '手数料は最大許容値に自動で設定されます',
  },
  MembershipInUse: {
    en: (noOfPositions) =>
      `This membership already has ${noOfPositions} members.`,
    ja: (noOfPositions) =>
      `すでに${noOfPositions}人のメンバーがこのメンバーシップを持っています。`,
  },
  Image: {
    en: () => 'Image',
    ja: () => '画像',
  },
  UploadToChangeImage: {
    en: () => 'Upload to change image',
    ja: () => 'アップロードして画像を変更する',
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
    ja: () => '価格を設定する',
  },
  Unpriced: {
    en: () => 'Unpriced',
    ja: () => '価格を設定せず招待制にする',
  },
  // note to Kent:
  // These two form one sentence, but are separated for HTML styling purposes <- Gotcha!
  UnpricedCannotBeBought: {
    en: () => 'Unpriced memberships cannot be bought,',
    ja: () =>
      '招待制のメンバーシップを設定する場合はInvitationのプラグインのインストールが必要です。',
  },
  AvailableInviteOnly: {
    en: () => 'they are available via invite only.',
    ja: () => '招待された場合のみ購入可能です',
  },
  // note to Kent:
  // These two form one sentence, but are separated for HTML styling purposes <- Gotcha!
  ChoosingUSDC: {
    en: () => 'If you choose USDC, you can activate ',
    ja: () => `<u>クレジットカードプラグイン</u>を有効にしたい場合は`,
  },
  CreditCardPlugin: {
    en: () => `<u>the credit card plugin.</u>`,
    ja: () => 'USDCを選択してください',
  },
  EarningModel: {
    en: () => 'Earning Model',
    ja: () => '収益モデル',
  },
  DEVEarningModelDisabled: {
    en: () => 'Earning model option is currently disabled for DEV',
    ja: () => '収益モデルのオプションは現在利用できません',
  },
  WhatIsStakingLink: {
    en: () => 'https://docs.devprotocol.xyz/concepts/devtoken#devs-tokenomics',
    ja: () => 'https://note.com/dev_guide/n/nc7ba51f51a13',
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
    ja: () => 'マークダウンが利用可能',
  },
  WhatIsMarkdown: {
    en: () => 'What is Markdown?',
    ja: () => 'マークダウンとは',
  },
  Payload: {
    en: () => 'Payload',
    ja: () => 'ペイロード',
  },
  AccessControl: {
    en: () => 'Access Control',
    ja: () => 'アクセスコントロール',
  },
  AccessControlURL: {
    en: () => 'Access Control URL',
    ja: () => 'アクセスコントロールURL',
  },
  DescriptionOfVerification: {
    en: () => 'Description of the verification process',
    ja: () => '認証プロセスの詳細',
  },
  WillEarnAtOnce: {
    // For example: "X USDC will be earned at 1 time"
    en: () => 'will be earned at 1 time.',
    ja: () => 'を収益として一度に得て、',
  },
  WillBeStaked: {
    // For example: "X USDC will will be staked to earn dev continuously."
    en: () => 'will be staked to earn DEV continuously.',
    ja: () => 'をステーキングして継続的にDEVを取得します',
  },
  ActionLabel: {
    en: ([label]) => {
      if (label === '次へ') {
        return 'Next'
      }

      // Default return.
      return 'Purchase'
    },
    ja: ([label]) => {
      if (label?.toLowerCase() === 'next') {
        return '次へ'
      }

      // Default return.
      return '購入する'
    },
  },
} satisfies ClubsI18nParts
