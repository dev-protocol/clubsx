<template>
  <div>
    <div>
      <img :src="badgeImageSrc" class="m-auto" width="400" height="400" />
    </div>
    <div class="text-2xl">{{ title }}</div>
    <div>{{ questId }}</div>
    <div class="text-gray-400">{{ description }}</div>
  </div>
</template>

<script>
export default {
  name: 'QuestCard',
  props: {
    title: String,
    questId: String,
    description: String,
    badgeImageSrc: String,
  },
}
</script>
