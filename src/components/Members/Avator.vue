<template>
  <div class="w-96 m-8 flex items-center">
    <img
      v-if="imgSrc"
      class="mr-8 rounded-full"
      style="width: 75px; height: 75px"
      :src="imgSrc"
    />
    <div
      v-else
      class="mr-8 rounded-full bg-blue-400"
      style="width: 75px; height: 75px"
    />
    <div class="w-64 text-ellipsis overflow-hidden" v-if="displayName">
      {{ name || accountAddress }}
    </div>
  </div>
</template>

<script lang="ts">
import { getAccount } from '../../fixtures/dev-for-apps'

export default {
  name: 'Avator',
  props: ['accountAddress', 'displayName'],
  data() {
    return {
      imgSrc: null,
      name: '',
    }
  },
  async created() {
    const res = await getAccount(this.accountAddress)
    this.imgSrc = res[0]?.portrait?.formats.thumbnail.url
    this.name = res[0]?.name
  },
}
</script>
