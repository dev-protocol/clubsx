<template>
  <div class="mx-4">
    <div class="mb-1 text-gray-400">Quests / {{ questId }}</div>
    <div class="text-2xl">{{ title }}</div>
    <div class="my-8 grid grid-cols-2 gap-4">
      <div>
        <img :src="badgeImageSrc" class="" width="400" height="400" />
      </div>
      <div>
        <div class="mb-2">{{ questId }}</div>
        <div class="text-gray-400">{{ description }}</div>
      </div>
    </div>
    <QuestInfo />
  </div>
</template>

<script>
import QuestInfo from './QuestInfo.vue'

export default {
  name: 'QuestDetail',
  props: {
    title: String,
    questId: String,
    description: String,
    badgeImageSrc: String,
  },
  components: {
    QuestInfo,
  },
}
</script>
