import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  ClubName: {
    en: () => 'Club Name',
    ja: () => '',
  },
  ProjectCategory: {
    en: () => 'Project Category',
    ja: () => '',
  },
  PublishingRecommendation: {
    en: () =>
      "These are used only for authentication when publishing. If you don't have any of these, we recommend ",
    ja: () => '',
  },
  CreatingDiscord: {
    en: () => 'creating a Discord server ↗',
    ja: () => '',
  },
  TwitterHandle: {
    en: () => 'Twitter Handle',
    ja: () => '',
  },
  Avatar: {
    en: () => 'Avatar',
    ja: () => '',
  },
  ImageSelect: {
    en: () => 'Select Image',
    ja: () => '',
  },
  RecommendedImageSize: {
    en: () => 'Recommended image size is 600px x 600px',
    ja: () => '',
  },
} satisfies ClubsI18nParts
