import vuex from 'vuex'
import { wallet } from './wallet'

export const store = vuex.createStore({
  modules: {
    wallet,
  },
})
