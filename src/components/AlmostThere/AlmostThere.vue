<script lang="ts">
import { Comment } from 'vue'
import HSButton from '../Primitives/Hashi/HSButton.vue'

export default {
  name: 'AlmostThere',
  components: { HSButton },
  data: () => ({
    daoName: '',
    dbSetStatus: '',
  }),
  methods: {
    setDb() {
      if (!this.daoName || this.daoName === '') {
        this.dbSetStatus = 'invalid-dao-name'
        return
      }

      this.dbSetStatus = 'successful'
    },
  },
  computed: {
    network() {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('network')
    },
    address() {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('address')
    },
  },
}
</script>

<template>
  <div class="mt-[10%] flex flex-col items-center justify-items-center">
    <section class="mb-16 mt-8">
      <h1 class="mb-2 text-center font-title text-7xl font-bold">
        Almost There
      </h1>
    </section>
    <section class="mb-16">
      <table class="table-auto py-4 px-6 text-xl">
        <tr class="py-4 px-6 text-left">
          <td class="py-4 px-6 text-left">Chain</td>
          <td class="py-4 px-6 text-left">{{ network || '' }}</td>
        </tr>
        <tr class="py-4 px-6 text-left">
          <td class="py-4 px-6 text-left">Token</td>
          <td class="py-4 px-6 text-left">{{ address || '' }}</td>
        </tr>
        <tr class="py-4 px-6 text-left">
          <td class="py-4 px-6 text-left">DAO name</td>
          <td class="py-4 px-6 text-left">
            <input
              class="rounded bg-gray-700 px-8 py-4"
              v-model="daoName"
              id="fullname"
              name="fullname"
              placeholder="Enter your DAO name"
              required
            />
          </td>
        </tr>
      </table>
    </section>
    <section class="mb-16" v-if="dbSetStatus !== ''">
      <!-- Depending on access logic, show either one -->
      <div v-if="dbSetStatus == 'successful'">
        <h1 class="font-title text-xl font-black text-green-500">
          Your DAO is setting up!
        </h1>
      </div>
      <div class="text-red-500" v-else-if="dbSetStatus == 'invalid-dao-name'">
        <h1 class="font-title text-xl font-black">
          Enter valid DAO name, it cannot be empty
        </h1>
      </div>
      <div class="text-red-500" v-else-if="dbSetStatus == 'failed'">
        <h1 class="font-title text-xl font-black">
          An error occured during setting your DAO.
        </h1>
      </div>
    </section>
    <section class="mb-4">
      <HSButton
        @click.prevent="setDb()"
        type="outlined"
        class="w-full gap-0.5 py-2 px-6"
        >Next</HSButton
      >
    </section>
  </div>
</template>
