import type { ClubsFunctionStandardPlugin } from '@devprotocol/clubs-core'

export const modules = {
  'devprotocol:clubs:plugin:community': () => import('@plugins/community'),
  'devprotocol:clubs:theme-1': () => import('@plugins/default-theme'),
  'devprotocol:clubs:plugin:join': () => import('@plugins/join'),
  'devprotocol:clubs:plugin:me': () => import('@plugins/me'),
  'devprotocol:clubs:plugin:members': () => import('@plugins/members'),
  'devprotocol:clubs:simple-memberships': () => import('@plugins/memberships'),
  'devprotocol:clubs:gated-contact-form': () => import('@plugins/message'),
  'devprotocol:clubs:plugin:quests': () => import('@plugins/quests'),
  'clubs-plugin-links': () =>
    import(
      '@kazu80/clubs-plugin-links'
    ) as Promise<ClubsFunctionStandardPlugin>,
  'devprotocol:clubs:collections': () => import('@plugins/collections'),
  'devprotocol:clubs:plugin:tickets': () => import('@plugins/tickets'),
  'devprotocol:clubs:plugin:posts': () =>
    import(
      '@devprotocol/clubs-plugin-posts'
    ) as Promise<ClubsFunctionStandardPlugin>,
  'devprotocol:clubs:plugin:posts:voting': () =>
    import('@devprotocol/clubs-plugin-posts-voting'),
  'devprotocol:clubs:plugin:pay-by-card': () => import('@plugins/pay-by-card'),
  'devprotocol:clubs:plugin:clubs-payments': () =>
    import('@plugins/clubs-payments'),
  'devprotocol:clubs:plugin:achievements': () =>
    import('@plugins/achievements'),
  'devprotocol:clubs:plugin:invitations': () => import('@plugins/invitations'),
  'devprotocol:clubs:huddle:plugin': () =>
    import(
      '@devprotocol/huddle01-clubs-plugin'
    ) as Promise<ClubsFunctionStandardPlugin>,
  'devprotocol:clubs:plugin:awesome-onboarding': () =>
    import('@devprotocol/clubs-plugin-awesome-onboarding'),
  'devprotocol:clubs:plugin:passport': () =>
    import('@devprotocol/clubs-plugin-passport'),
}
