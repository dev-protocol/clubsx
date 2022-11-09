<script>
import { Comment } from 'vue'
import HSButton from '../Primitives/Hashi/HSButton.vue'

export default {
  name: 'GetStarted',
  components: { HSButton },
  data: () => ({
    socialMedia: 'discord',
    network: 'polygon',
  }),
  methods: {
    setSocialMedia(socialMedia) {
      this.socialMedia = socialMedia.toLowerCase()
    },
  },
  computed: {
    link() {
      return `https://${this.network.toLowerCase()}.niwa.xyz/tokenize/${this.socialMedia.toLowerCase()}`
    },
  },
}
</script>

<template>
  <div class="mt-[10%] flex flex-col items-center justify-items-center">
    <section class="mb-16 mt-8">
      <h1 class="mb-2 text-center font-title text-7xl font-bold">
        Let's get started
      </h1>
      <p class="mb-2 text-center font-title text-xl">
        First, create your DAO tokens with your online account
      </p>
    </section>
    <section class="mb-4">
      <HSButton
        v-bind:type="
          this.socialMedia.toLowerCase() === 'youtube' ? 'filled' : 'outlined'
        "
        @click.prevent="setSocialMedia('youtube')"
        class="w-full gap-0.5 py-4 px-6"
      >
        Youtube
      </HSButton>
    </section>
    <section
      class="mb-16 flex flex-row flex-wrap content-center justify-center gap-10"
    >
      <HSButton
        @click.prevent="setSocialMedia('github')"
        v-bind:type="
          this.socialMedia.toLowerCase() === 'github' ? 'filled' : 'outlined'
        "
        class="py-4 px-6"
        >Github</HSButton
      >
      <HSButton
        @click.prevent="setSocialMedia('discord')"
        v-bind:type="
          this.socialMedia.toLowerCase() === 'discord' ? 'filled' : 'outlined'
        "
        class="py-4 px-6"
        >Discord</HSButton
      >
    </section>
    <section class="mb-16">
      <select
        name="network"
        id="network"
        class="hs-button is-outlined bg-transparent p-2 text-white"
        v-model="network"
      >
        <option value="polygon" selected>Network: Polygon</option>
        <option value="ethereum">Network: Ethereum</option>
        <option value="bsc">Network: Binance Smart Chain</option>
      </select>
    </section>
    <section class="mb-4">
      <HSButton :link="link" type="outlined" class="w-full gap-0.5 py-2 px-6"
        >Next</HSButton
      >
    </section>
  </div>
</template>
