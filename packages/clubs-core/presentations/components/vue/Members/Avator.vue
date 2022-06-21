<template>
  <div class="m-8 flex items-center">
    <img v-if="imgSrc" class="rounded-full" :style="style" :src="imgSrc" />
    <div v-else class="rounded-full bg-blue-400" :style="style" />
    <div class="ml-8 w-64 overflow-hidden text-ellipsis" v-if="displayName">
      {{ name || accountAddress }}
    </div>
  </div>
</template>

<script lang="ts">
import { getAccount } from 'packages/clubs-core/functions/dev-for-apps'

export default {
  name: 'Avator',
  props: ['accountAddress', 'displayName', 'height', 'width'],
  data() {
    return {
      imgSrc: null,
      name: '',
      style: `width: ${this.width || 75}px; height: ${this.height || 75}px;`,
    }
  },
  async created() {
    const res = await getAccount(this.accountAddress)
    this.imgSrc = res[0]?.portrait?.formats.thumbnail.url
    this.name = res[0]?.name
  },
}
</script>
