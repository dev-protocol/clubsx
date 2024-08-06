import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  DiscordAuthCallbackHeader: {
    en: () => 'Select a Discord Guild',
    ja: () => 'Discordギルドを選択してください',
  },
  GithubProjectInfoHeader: {
    en: () => `Github Project Information`,
    ja: () => `Githubプロジェクト情報`,
  },
  GithubProjectInfoSubHeader: {
    en: () => '',
    ja: () => '',
  },
  DiscordAuthCallbackSubHeader: {
    en: () => '',
    ja: () => '',
  },
  DiscordAuthCallbackError: {
    en: () => 'Your Discord server (Guild) could not be loaded.',
    ja: () => `Discord サーバー (ギルド) を読み込むことができませんでした。`,
  },
  DiscordAuthCallbackNoGuild: {
    en: () => `You do not have your own discord server (guild).`,
    ja: () => `独自の Discord サーバー (ギルド) を持っていません。`,
  },
  DiscordAuthCallbackGuildName: {
    en: () => `Guild name`,
    ja: () => `ギルド名`,
  },
  Next: {
    en: () => 'Next',
    ja: () => `次`,
  },
  GithubAssetNameLabel: {
    en: () => 'Github Repository Name',
    ja: () => `Github リポジトリ名`,
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
      `The PAT is confidentially authenticated using the Khaos oracle. <br /><a href='https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens'>Create a Personal Access Token without any scopes.</a>`,
    ja: () =>
      `PAT は、Khaos oracle を使用して秘密裏に認証されます。<a href='https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens'>スコープなしでパーソナル アクセス トークンを作成します。</a>`,
  },
} satisfies ClubsI18nParts
