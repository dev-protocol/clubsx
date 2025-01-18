<script setup lang="ts">
import iconHome from '@assets/footer/icon-home.png'
import iconClubs from '@assets/footer/icon-clubs.png'
import iconMe from '@assets/footer/icon-me.png'
</script>
<template>
  <div
    class="md:fixed md:bottom-8 md:drop-shadow md:left-2/4 md:-translate-x-1/2 md:w-[calc(640px_*_0.7)] md:border md:rounded-3xl flex justify-between px-16 py-2 text-dp-blue-grey-200 border-t border-black border-opacity-10 bg-white"
  >
    <a href="/" class="flex flex-col items-center gap-0">
      <img class="w-6" :src="iconHome.src" alt="HOME" />
      <p class="text-xs">Home</p>
    </a>
    <a href="/clubs" class="flex flex-col items-center gap-0">
      <img class="w-6" :src="iconClubs.src" alt="Clubs" />
      <p class="text-xs">Clubs</p>
    </a>
    <a href="/signin" class="flex flex-col items-center gap-0">
      <img class="w-6" :src="iconMe.src" alt="Me" />
      <p class="text-xs">Me</p>
    </a>
  </div>
</template>
