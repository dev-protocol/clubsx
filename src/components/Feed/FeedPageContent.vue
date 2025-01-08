<script setup lang="ts">
import iconHome from '@assets/footer/icon-home.png'
import iconClubs from '@assets/footer/icon-clubs.png'
import iconMe from '@assets/footer/icon-me.png'
</script>
<template>
  <div class="flex flex-col px-2 h-full">
    <p class="text-base font-bold">Latest updates</p>
    <div class="flex flex-col gap-2">
      <div class="flex gap-3 p-2 rounded-xl bg-yellow-400">
        <div class="flex flex-col flex-grow">
          <div class="flex items-center gap-3">
            <img class="rounded-full w-14 h-14" src="https://mdbootstrap.com/img/Photos/Avatars/img%20(10).jpg" alt="avatar" />
            <div class="flex flex-col flex-grow gap-0">
              <div class="text-xs font-bold">name</div>
              <div class="flex items-center gap-2 p-1 rounded-sm bg-white" style="width: fit-content">
                <img class="w-7 rounded-sm" style="aspect-ratio: 16 / 9" src="https://mdbootstrap.com/img/Photos/Avatars/img%20(10).jpg" alt="avatar" />
                <p class="text-xs font-bold">Animal</p>
              </div>
            </div>
          </div>
          <div class="w-full text-2xl font-bold">description</div>
        </div>
        <div class="flex items-end">
          <img class="w-16 h-16 rounded" src="https://mdbootstrap.com/img/Photos/Avatars/img%20(10).jpg" alt="avatar" />
        </div>
      </div>
    </div>
  </div>
</template>
