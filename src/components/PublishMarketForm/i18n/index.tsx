import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  DiscordAuthCallbackHeader: {
    en: () => 'Select a Discord Guild',
    ja: () => 'Discordギルドを選択してください',
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
} satisfies ClubsI18nParts
