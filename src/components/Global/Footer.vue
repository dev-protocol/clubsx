<script setup lang="ts">
import iconStore from '@assets/footer/icon-store.svg'
import iconRandom from '@assets/footer/icon-random.svg'
import iconHome from '@assets/footer/home-icon.svg'
import iconProfile from '@assets/footer/icon-profile.svg'

const props = defineProps<{
  user: string
}>()
</script>
<template>
  <div
    class="text-dp-blue-grey-200 fixed bottom-0 z-[999] grid w-full grid-cols-5 justify-between border-t border-black border-opacity-10 bg-white px-5 py-2 md:bottom-8 md:left-2/4 md:w-[calc(640px_*_0.7)] md:-translate-x-1/2 md:rounded-3xl md:border md:drop-shadow"
  >
    <a href="/app" class="flex flex-col items-center gap-0">
      <img :src="iconHome.src" alt="HOME" />
      <p class="text-xs">Home</p>
    </a>
    <a href="/app" class="flex flex-col items-center gap-0">
      <img :src="iconRandom.src" alt="RANDOM" />
      <p class="text-xs">Random</p>
    </a>
    <a
      :href="`/passport/${props.user}`"
      class="block rounded-xl bg-gradient-to-r from-[#B200FF] via-[#FF0048] to-[#5500FF] p-0.5"
    >
      <div class="flex h-full w-full items-center rounded-[.65rem] bg-black">
        <svg
          class="m-auto"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.5 16.875H16.875M16.875 16.875H20.25M16.875 16.875V13.5M16.875 16.875V20.25M6 10.5H8.25C8.84674 10.5 9.41903 10.2629 9.84099 9.84099C10.2629 9.41903 10.5 8.84674 10.5 8.25V6C10.5 5.40326 10.2629 4.83097 9.84099 4.40901C9.41903 3.98705 8.84674 3.75 8.25 3.75H6C5.40326 3.75 4.83097 3.98705 4.40901 4.40901C3.98705 4.83097 3.75 5.40326 3.75 6V8.25C3.75 8.84674 3.98705 9.41903 4.40901 9.84099C4.83097 10.2629 5.40326 10.5 6 10.5ZM6 20.25H8.25C8.84674 20.25 9.41903 20.0129 9.84099 19.591C10.2629 19.169 10.5 18.5967 10.5 18V15.75C10.5 15.1533 10.2629 14.581 9.84099 14.159C9.41903 13.7371 8.84674 13.5 8.25 13.5H6C5.40326 13.5 4.83097 13.7371 4.40901 14.159C3.98705 14.581 3.75 15.1533 3.75 15.75V18C3.75 18.5967 3.98705 19.169 4.40901 19.591C4.83097 20.0129 5.40326 20.25 6 20.25ZM15.75 10.5H18C18.5967 10.5 19.169 10.2629 19.591 9.84099C20.0129 9.41903 20.25 8.84674 20.25 8.25V6C20.25 5.40326 20.0129 4.83097 19.591 4.40901C19.169 3.98705 18.5967 3.75 18 3.75H15.75C15.1533 3.75 14.581 3.98705 14.159 4.40901C13.7371 4.83097 13.5 5.40326 13.5 6V8.25C13.5 8.84674 13.7371 9.41903 14.159 9.84099C14.581 10.2629 15.1533 10.5 15.75 10.5Z"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </a>
    <a href="/clubs" class="flex flex-col items-center gap-0">
      <img :src="iconStore.src" alt="STORE" />
      <p class="text-xs">Store</p>
    </a>
    <a href="/profile" class="flex flex-col items-center gap-0">
      <img :src="iconProfile.src" alt="PROFILE" />
      <p class="text-xs">Profile</p>
    </a>
  </div>
</template>
