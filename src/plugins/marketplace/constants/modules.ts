export const modules = {
  'devprotocol:clubs:plugin:community': () => import('@plugins/community'),
  'devprotocol:clubs:theme-1': () => import('@plugins/default-theme'),
  'devprotocol:clubs:plugin:join': () => import('@plugins/join'),
  'devprotocol:clubs:plugin:me': () => import('@plugins/me'),
  'devprotocol:clubs:plugin:members': () => import('@plugins/members'),
  'devprotocol:clubs:simple-memberships': () => import('@plugins/memberships'),
  'devprotocol:clubs:gated-contact-form': () => import('@plugins/message'),
  'devprotocol:clubs:plugin:quests': () => import('@plugins/quests'),
  'clubs-plugin-links': () => import('@kazu80/clubs-plugin-links'),
  'devprotocol:clubs:plugin:tickets': () => import('@plugins/tickets'),
  'devprotocol:clubs:plugin:posts': () =>
    import('@devprotocol/clubs-plugin-posts'),
  'devprotocol:clubs:plugin:pay-by-card': () => import('@plugins/pay-by-card'),
  'devprotocol:clubs:plugin:clubs-payments': () =>
    import('@plugins/clubs-payments'),
}
