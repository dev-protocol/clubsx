<template>
  <div class="flex items-center m-8">
    <img
      v-if="imgSrc"
      class="rounded-full mr-8"
      style="width: 75px; height: 75px"
      :src="imgSrc"
    />
    <div
      v-else
      class="bg-blue-400 rounded-full mr-8"
      style="width: 75px; height: 75px"
    />
    <div v-if="displayName">
      {{ name }}
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
    console.log(res)
    this.imgSrc = res[0]?.portrait?.formats.thumbnail.url
    this.name = res[0].name
  },
}
</script>
