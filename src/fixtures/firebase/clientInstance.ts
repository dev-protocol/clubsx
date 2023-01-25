import type { Auth } from 'firebase/auth'
import { initializeFirebase } from '@fixtures/firebase'

const store = new Set<Auth>()

export const instanceStore = {
  get initializedApp() {
    const i = store.values()
    const fromStore = i.next().value as Auth | undefined
    const res = fromStore ? fromStore : initializeFirebase()
    store.add(res)
    return res
  },
}
