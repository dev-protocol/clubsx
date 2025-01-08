<script setup lang="ts">
import avatar01 from '@assets/feed/avatar01.png'
import image01 from '@assets/feed/image01.png'
import asset01 from '@assets/feed/asset01.png'
</script>
<template>
  <div class="flex flex-col px-2 h-full">
    <p class="text-base font-bold">Latest updates</p>
    <div class="flex flex-col gap-2">
      <div class="flex gap-3 p-2 rounded-xl bg-yellow-400">
        <div class="flex flex-col flex-grow">
          <div class="flex items-center gap-3">
            <img
              class="rounded-full w-14 h-14"
              :src="avatar01.src"
              alt="avatar"
            />
            <div class="flex flex-col flex-grow gap-0">
              <div class="text-xs font-bold">long-name long-name long-name long-name long-name long-name</div>
              <div
                class="flex items-center gap-2 p-1 rounded-sm bg-white"
                style="width: fit-content"
              >
                <img
                  class="w-7 rounded-sm"
                  style="aspect-ratio: 16 / 9"
                  :src="image01.src"
                  alt="image"
                />
                <p class="text-xs font-bold">Animal</p>
              </div>
            </div>
          </div>
          <div class="w-full text-2xl font-bold">description</div>
        </div>
        <div class="flex items-end max-w-16">
          <img
            class="w-full rounded"
            style="aspect-ratio: 1 / 1"
            :src="asset01.src"
            alt="asset"
          />
        </div>
      </div>
    </div>
  </div>
</template>
