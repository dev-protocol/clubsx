<template>
  <div class="bg-cover bg-center">
    <h3 class="mb-8 font-title text-2xl font-bold">Membership</h3>
    <div
      v-if="memberships.length > 0"
      class="border-dp-black-200 grid gap-8 rounded border md:grid-cols-3"
    >
      <div
        v-for="membership in memberships"
        :key="membership.ownerAddress"
        class="p-4"
      >
        <STokenPositions
          :stokenID="membership.id"
          layout="square"
          :rpcUrl="rpcUrl"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  detectStokensByPropertyAddress,
  getStokenOwnerOf,
} from '@fixtures/dev-kit'
import Avator from '@components/Members/Avator.vue'
import STokenPositions from '@components/Members/STokenPositions.vue'
import { positionsOfOwner } from '@fixtures/dev-kit'
import { connection as getConnection } from '@devprotocol/clubs-core/connection'
import { zip } from 'rxjs'
import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'

// NOTE: It is assumed to be used on a wallet-connected page.
export default {
  props: {
    propertyAddress: String,
    rpcUrl: String,
  },
  data() {
    return {
      memberships: [],
    }
  },
  async mounted() {
    const connection = getConnection()

    zip(connection.provider, connection.account).subscribe(
      async ([provider, account]) => {
        whenDefinedAll(
          [provider, account, this.propertyAddress],
          async ([prov, userAddress, propertyAddress]) => {
            const stokenIDs = await detectStokensByPropertyAddress(
              prov,
              propertyAddress
            )

            const accountStokenIDs = await positionsOfOwner(prov, userAddress)

            const membershipStokenIDs = accountStokenIDs?.filter((stokenID) =>
              stokenIDs?.includes(stokenID)
            )

            const ret = await whenDefined(membershipStokenIDs, (ids) =>
              Promise.all(
                ids.map(async (stokenID) => {
                  return await getStokenOwnerOf(provider, stokenID).then(
                    (ownerAddress) => {
                      return {
                        id: stokenID,
                        ownerAddress,
                      }
                    }
                  )
                })
              )
            )
            console.log({ ret })
            this.memberships = ret ?? []
          }
        )
      }
    )
  },
  components: {
    Avator,
    STokenPositions,
  },
}
</script>
