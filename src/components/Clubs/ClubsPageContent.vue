<script lang="ts" setup>
import preview01 from '@assets/clubs/preview01.png'
import arrowRight from '@assets/clubs/arrow-right.svg'
import movie from '@assets/clubs/box.mp4'
</script>

<template>
  <div class="flex flex-col gap-1 px-2 h-full">
    <div class="flex flex-col gap-4">
      <a
        href="/"
        class="flex items-center gap-3 p-2 bg-right bg-no-repeat"
        :style="`background-image: url(${arrowRight.src});`"
      >
        <img
          class="w-44 rounded"
          style="aspect-ratio: 1/1"
          :src="preview01.src"
          alt="Mystic Horizon"
        />
        <p class="text-xs font-bold">Mystic Horizon</p>
      </a>
    </div>
    <div
      class="flex flex-col justify-center items-center gap-1 w-full border-dotted border-dp-white-400 border-4 rounded-xl"
      style="aspect-ratio: 1/1"
    >
      <p class="text-xs font-bold">More Upcoming Clubs Await.</p>
      <video
        class="w-24"
        style="aspect-ratio: 1/1"
        src="/assets/box.mp4"
        autoplay
        loop
      ></video>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
