<script lang="ts" setup>
import arrowRight from '@assets/clubs/arrow-right.svg'
</script>

<template>
  <div class="flex flex-col gap-1 px-2 h-full">
    <div class="flex flex-col gap-4">
      <a
        href="https://prerelease.clubs.place/giruguru"
        class="flex items-center gap-3 p-2 bg-right bg-no-repeat"
        :style="`background-image: url(${arrowRight.src});`"
      >
        <img
          class="w-44 rounded"
          style="aspect-ratio: 1/1"
          src="https://storage.clubs.place/iwjlLc_RQxaNyA7YSC7FE"
          alt="Mystic Horizon"
        />
        <p class="text-xs font-bold">ぎるぐる</p>
      </a>
    </div>
    <div
      class="flex flex-col justify-center items-center gap-1 mx-auto w-[80%] border-dotted border-dp-white-400 border-4 rounded-xl"
      style="aspect-ratio: 1/1"
    >
      <p class="text-xs font-bold">More Upcoming Clubs Await.</p>
      <video
        class="w-24"
        style="aspect-ratio: 1/1"
        src="/assets/box.mp4"
        autoplay
        loop
        muted
        playsinline
      ></video>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
