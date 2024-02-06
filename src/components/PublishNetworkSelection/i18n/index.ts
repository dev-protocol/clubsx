import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  ChooseNetwork: {
    en: () => 'Choose Network',
    ja: () => 'ネットワークを選択',
  },
  NetworkDifference: {
    en: () => 'What is the difference between networks?',
    ja: () => 'ネットワークの違いについて',
  },
  Recommended: {
    en: () => 'Recommended',
    ja: () => '推奨',
  },
  Activate: {
    en: () => 'Activate',
    ja: () => '有効にする',
  },
  ExistingProperty: {
    en: () =>
      'Already have a property on Niwa? Click to enter your property address.',
    ja: () => 'Niwaにプロパティがある場合はプロパティアドレスを入力',
  },
  NoToken: {
    en: () => "Don't have a token for your Club yet? Click here to activate.",
    ja: () =>
      'クラブにトークンがない場合は、ここをクリックして有効にしてください',
  },
  ActivateToken: {
    en: () => 'Activate your Club token.',
    ja: () => 'クラブトークンを有効にする',
  },
  MissingStep: {
    en: () => 'Complete Basic info, Design, Memberships before activation.',
    ja: () =>
      '有効にする前に、基本情報、デザイン、メンバーシップの設定を完了させましょう',
  },
  EnableMemberships: {
    en: () => 'Enable a memberships contract to use memberships.',
    ja: () =>
      'メンバーシップを使うためにメンバーシップコントラクトを有効にしましょう',
  },
  StoreMemberships: {
    en: () => 'Store your memberships to a contract.',
    ja: () => 'メンバーシップをコントラクトに保存する',
  },
  InitMemberships: {
    en: () => 'Initialize your memberships',
    ja: () => 'メンバーシップを初期化する',
  },
  InitMembershipsFailed: {
    en: () => 'Failed to initialize memberships, try again!',
    ja: () => 'メンバーシップの初期化に失敗しました。もう一度試してください。',
  },
  SettingUpMemberships: {
    en: () => 'Setting up memberships...',
    ja: () => 'メンバーシップの設定をしています',
  },
  SettingUpMembershipsFailed: {
    en: () => 'Setting up memberships failed, try again!',
    ja: () => 'メンバーシップの設定に失敗しました。もう一度試してください。',
  },
  MembershipSetupComplete: {
    en: () => 'Membership setup complete!',
    ja: () => 'メンバーシップの設定が完了しました。',
  },
  FetchingDetails: {
    en: () => 'Fetching initialization details...',
    ja: () => '初期化の詳細を読み込んでいます。',
  },
  MembershipInitialized: {
    en: () => 'Membership initialized, fetching setup details...',
    ja: () => 'メンバーシップを初期化しました。設定の詳細を読み込んでいます。',
  },
  ActivationInProgress: {
    en: () => 'Activation in progress...',
    ja: () => '有効にしています。',
  },
  ActivationFailed: {
    en: () => 'Activating failed, try again!',
    ja: () => '有効にできませんでした。もう一度試してください。',
  },
  Activated: {
    en: () => 'Activated, setting up initialization..',
    ja: () => '有効になりました。初期化の設定をしています。',
  },
  Finalizing: {
    en: () => 'Finalizing publishing...',
    ja: () => '発行しています。',
  },
  PublishFailed: {
    en: () => 'Publishing failed, try again!',
    ja: () => '発行に失敗しました。もう一度試してください。',
  },
  LoadingOverview: {
    en: () => 'Your Club is published, loading overview...',
    ja: () => 'クラブが発行されました。概要をロード中です。',
  },
  Publishing: {
    en: () => 'Publishing your club...',
    ja: () => 'クラブを発行しています。',
  },
  PreparingPublishing: {
    en: () => 'Preparing publishing your club...',
    ja: () => 'クラブの発行を準備しています。',
  },
  AwaitingConfirmation: {
    en: () => 'Awaiting transaction confirmation on wallet...',
    ja: () => 'ウォレットのトランザクション確認を待っています。',
  },
  TransactionProcessing: {
    en: () => 'Transaction processing on the blockchain...',
    ja: () => 'ブロックチェーンのトランザクション処理中。',
  },
  InitializationComplete: {
    en: () => 'Initialization complete!',
    ja: () => '初期化が完了しました。',
  },
  NoProvider: {
    en: () => 'No provider provided, try again!',
    ja: () => 'プロバイダがありません。もう一度試してください。',
  },
  AddressFailed: {
    en: () => 'Entered address failed, try again!',
    ja: () => 'アドレスが間違っています。もう一度試してください。',
  },
} satisfies ClubsI18nParts
