import type {
  ClubsFunctionGetSlots,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory } from '@devprotocol/clubs-core'
import Web3AuthButton from './Web3AuthButton.astro'
import Readme from './readme.astro'

export const getSlots = (async (_, { chainId, rpcUrl }) => {
  return [
    {
      slot: 'clubs:connect-button',
      component: Web3AuthButton,
      props: {
        chainId,
        rpcUrl,
      },
    },
  ]
}) satisfies ClubsFunctionGetSlots

export const meta = {
  id: 'devprotocol:clubs:plugin:web3auth',
  displayName: 'Web3Auth',
  category: ClubsPluginCategory.Uncategorized,
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getSlots,
  meta,
} satisfies ClubsFunctionPlugin
