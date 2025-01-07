<script setup lang="ts">
import iconHome from '@assets/footer/icon-home.png'
import iconClubs from '@assets/footer/icon-clubs.png'
import iconMe from '@assets/footer/icon-me.png'
</script>
<template>
  <div class="flex justify-between px-16 py-2 text-dp-blue-grey-200 border-t border-black border-opacity-10">
    <a href="/" class="flex flex-col items-center gap-0">
      <img class="w-6" :src="iconHome.src" alt="HOME" />
      <p class="text-xs">Home</p>
    </a>
    <a href="/" class="flex flex-col items-center gap-0">
      <img class="w-6" :src="iconClubs.src" alt="Clubs" />
      <p class="text-xs">Clubs</p>
    </a>
    <a href="/" class="flex flex-col items-center gap-0">
      <img class="w-6"  :src="iconMe.src" alt="Me" />
      <p class="text-xs">Me</p>
    </a>
  </div>
</template>
