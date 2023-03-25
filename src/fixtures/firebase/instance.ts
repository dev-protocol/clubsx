import type { Auth } from 'firebase-admin/auth'
import { initializeFirebaseAdmin } from '@fixtures/firebase/initializeFirebaseAdmin'

const store = new Set<Auth>()

export const instanceStore = {
  get initializedAdminApp() {
    const i = store.values()
    const fromStore = i.next().value as Auth | undefined
    const res = fromStore ? fromStore : initializeFirebaseAdmin()
    store.add(res)
    return res
  },
}
