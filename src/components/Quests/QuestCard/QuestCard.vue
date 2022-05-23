<template>
  <div>
    <div>
      <img :src="badgeImageSrc" class="m-auto" width="400" height="400" />
    </div>
    <div class="text-2xl">{{ title }}</div>
    <div>{{ id }}</div>
    <div class="text-gray-400">{{ description }}</div>
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
}
</script>
