import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  ClubName: {
    en: () => 'Club Name',
    ja: () => 'クラブの名称',
  },
  ProjectCategory: {
    en: () => 'Project Category',
    ja: () => 'プロジェクトカテゴリ',
  },
  PublishingRecommendation: {
    en: () =>
      "These are used only for authentication when publishing. If you don't have any of these, we recommend ",
    ja: () =>
      '選択したプロジェクトはクラブを発行する際に認証する目的でのみ使用します。いずれも持っていない場合は',
  },
  CreatingDiscord: {
    en: () => 'creating a Discord server ↗',
    ja: () => 'Discordサーバーの作成を推奨します',
  },
  TwitterHandle: {
    en: () => 'Twitter Handle',
    ja: () => 'ツイッターのハンドル',
  },
  Avatar: {
    en: () => 'Avatar',
    ja: () => 'アバター',
  },
  ImageSelect: {
    en: () => 'Select Image',
    ja: () => '画像を選択する',
  },
  RecommendedImageSize: {
    en: () => 'Recommended image size is 600px x 600px',
    ja: () => '推奨サイズ 600 x 600 ピクセル',
  },
} satisfies ClubsI18nParts
