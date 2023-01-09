<template>
  <section class="flex grid-cols-2 items-center justify-start gap-8">
    <section class="grid w-[49%] gap-3">
      <p class="font-mono text-base font-normal">1/</p>
      <section
        class="align-items-center flex items-center justify-items-center gap-3"
      >
        <img alt="Status" :src="checkImage" class="h-6 w-6" />
        <h2 class="font-title text-2xl font-bold opacity-50">
          <s>Connect your wallet</s>
        </h2>
      </section>
      <p class="text-base">How to create a wallet?</p>
    </section>
    <section class="w-[49%] gap-4 p-4">
      <button
        class="w-full rounded border-[3px] border-[#000000] bg-[#040B10] py-6 px-8 opacity-50"
      >
        <p class="font-DMSans text-base font-bold text-[#FFFFFF]">Connected</p>
      </button>
    </section>
  </section>
</template>

<script>
export default {
  name: 'PublishConnect',
  props: {
    checkImage: String,
  },
}
</script>
