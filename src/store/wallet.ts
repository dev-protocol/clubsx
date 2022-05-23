export const wallet = {
  namespaced: true,
  state() {
    return {
      walletAddress: undefined,
      provider: undefined,
    }
  },
  getters: {
    getWalletAddress: (state: any) => {
      return state.walletAddress
    },
    getProvider: (state: any) => {
      return state.provider
    },
  },
  mutations: {
    setWalletAddress(state: any, payload: any) {
      state.walletAddress = payload.walletAddress
    },
    resetWalletAddress(state: any) {
      state.walletAddress = undefined
    },
    setProvider(state: any, payload: any) {
      state.provider = payload.provider
    },
  },
}
