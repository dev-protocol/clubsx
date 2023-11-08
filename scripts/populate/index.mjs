import { db } from './utils/db.mjs'

const action = async () => {
  const client = await db()

  const scripts = await Promise.all([
    import('./cryptocafe.mjs'),
    import('./cryptocafe-debug.mjs'),
    import('./kougenji.mjs'),
    import('./temples.mjs'),
    import('./testing-for-dashboard-2.mjs'),
  ])

  await Promise.all(scripts.map((script) => script.default(client)))

  await client.quit()
}

action()
