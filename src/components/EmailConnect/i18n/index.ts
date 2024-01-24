import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
  EmailSending: {
    en: () => 'Sending a magic link',
    ja: () => 'マジックリンクを送る',
  },
  EmailSent: {
    en: () => 'Check your inbox',
    ja: () => 'メールを確認してください',
  },
  Continue: {
    en: () => 'Continue',
    ja: () => '続ける',
  },
  EmailPlaceholder: {
    en: () => 'Your email',
    ja: () => 'あなたのメールアドレス',
  },
} satisfies ClubsI18nParts
