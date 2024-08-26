import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  DiscordAuthCallbackHeader: {
    en: () => 'Discord Guild Information',
    ja: () => 'Discordギルドの情報',
  },
  DiscordAuthCallbackSubHeader: {
    en: () => 'Select a Discord Guild',
    ja: () => 'Discordギルドを選択',
  },
  DiscordAuthCallbackError: {
    en: () => 'Your Discord Servers (Guilds) could not be loaded.',
    ja: () => `Discord サーバー (ギルド) をロードできませんでした。`,
  },
  DiscordAuthCallbackNoGuild: {
    en: () => `You do not have your own Discord Server (Guild).`,
    ja: () => `Discord サーバー (ギルド) を所有していません。`,
  },
  DiscordAuthCallbackGuildName: {
    en: ([name]) => `Guild: ${name}`,
    ja: ([name]) => `ギルド: ${name}`,
  },
  DiscordGuildId: {
    en: ([id]) => `(Guild ID: ${id})`,
    ja: ([id]) => `(ギルドID: ${id})`,
  },
  FetchingDiscordGuild: {
    en: () => `Fetching your Discord Guilds`,
    ja: () => `Discord ギルドを取得する`,
  },
  GithubProjectInfoHeader: {
    en: () => `Github Project Information`,
    ja: () => `Githubプロジェクト情報`,
  },
  GithubProjectInfoSubHeader: {
    en: () => 'Enter your Github project and Access Token',
    ja: () => 'Githubプロジェクトとアクセストークンを入力',
  },
  GithubAssetNameLabel: {
    en: () => 'Github Repository Name',
    ja: () => `Githubのリポジトリ名`,
  },
  GithubAssetNameHelper: {
    en: () =>
      '* The owner name and repositry name. Example: dev-protocol/clubsx.',
    ja: () => `* 所有者名とリポジトリ名。例: dev-protocol/clubsx。`,
  },
  PersonalAccessTokenLabel: {
    en: () => `Personal Access Token`,
    ja: () => `パーソナルアクセストークン`,
  },
  PersonalAccessTokenHelper: {
    en: () =>
      `* The PAT is confidentially authenticated using the Khaos oracle.<br />* <a class="hs-form-field__helper" href='https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens'><u>Create a Personal Access Token without any scopes.</u></a>`,
    ja: () =>
      `* PAT はKhaos oracle を使用して内密に認証されます。<br />* <a class="hs-form-field__helper" href='https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens'><u>スコープなしでパーソナル アクセス トークンを作成します。</u></a>`,
  },
  YoutubeAuthCallbackHeader: {
    en: () => 'Youtube Channel Information',
    ja: () => 'Youtubeチャンネルの情報',
  },
  YoutubeAuthCallbackSubHeader: {
    en: () => '',
    ja: () => '',
  },
  YoutubeAuthCallbackNoChannel: {
    en: () => `You do not have your own Youtube Channel.`,
    ja: () => `Youtubeチャンネルを所有していません。`,
  },
  FetchingYoutubeChannel: {
    en: () => `Fetching your Youtube Channel.`,
    ja: () => `YouTubeチャンネルを取得しています。`,
  },
  YoutubeAuthCallbackError: {
    en: () => 'Your Youtube Channel could not be loaded.',
    ja: () => `Youtubeチャンネルを読み込めませんでした。`,
  },
  YoutubeAuthCallbackChannelFound: {
    en: () => 'Fetched your Youtube Channel. Redirecting you to setup page.',
    ja: () =>
      `Youtube チャンネルを取得しました。設定ページにリダイレクトされます。`,
  },
  Next: {
    en: () => 'Next',
    ja: () => `次`,
  },
} satisfies ClubsI18nParts
