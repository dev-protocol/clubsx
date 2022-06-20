<template>
  <div>
    <div>
      <img :src="badgeImageSrc" width="256" height="256" />
    </div>
    <div class="text-2xl">{{ title }}</div>
  </div>
</template>

<script>
export default {
  name: 'Badge',
  props: {
    title: String,
    badgeImageSrc: String,
  },
}
</script>
