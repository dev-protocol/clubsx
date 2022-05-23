<template>
  <div>
    <div>
      <img :src="badgeImageSrc" class="" width="256" height="256" />
    </div>
    <div class="text-2xl">{{ title }}</div>
    <div class="mb-2">{{ description }}</div>
    <a :href="idLink">
      <button class="rounded-sm border bg-gray-600 p-2 px-4">Select</button>
    </a>
  </div>
</template>

<script>
export default {
  name: 'QuestCard',
  props: {
    title: String,
    id: String,
    description: String,
    badgeImageSrc: String,
  },
  data() {
    return {
      idLink: `/join/${this.id}`,
    }
  },
}
</script>
