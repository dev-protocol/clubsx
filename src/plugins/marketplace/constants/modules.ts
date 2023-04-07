export const modules = {
  'devprotocol:clubs:plugin:community': () => import('@plugins/community'),
  'devprotocol:clubs:theme-1': () => import('@plugins/default-theme'),
  'devprotocol:clubs:plugin:join': () => import('@plugins/join'),
  'devprotocol:clubs:plugin:me': () => import('@plugins/me'),
  'devprotocol:clubs:plugin:members': () => import('@plugins/members'),
  'devprotocol:clubs:simple-memberships': () => import('@plugins/memberships'),
  'devprotocol:clubs:gated-contact-form': () => import('@plugins/message'),
  'devprotocol:clubs:plugin:quests': () => import('@plugins/quests'),
  // @ts-ignore
  'clubs-plugin-links': () => import('@kazu80/clubs-plugin-links'),
}
