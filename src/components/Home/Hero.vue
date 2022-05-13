<template>
  <swiper
    :modules="modules"
    :slides-per-view="1"
    :space-between="50"
    navigation
    loop="true"
    :autoplay="{ delay: 3000, disableOnInteraction: false }"
    class="inset-0"
  >
    <div class="absolute inset-0 bg-black"></div>
    <swiper-slide
      ><img
        src="/assets/cover-1.jpg"
        class="h-full w-full object-cover opacity-80"
    /></swiper-slide>
    <swiper-slide
      ><img
        src="/assets/cover-2.jpg"
        class="opacity-8 h-full w-full object-cover opacity-80"
    /></swiper-slide>
    <swiper-slide
      ><img
        src="/assets/cover-3.jpg"
        class="h-full w-full object-cover opacity-80"
    /></swiper-slide>
  </swiper>
</template>

<script>
import { Navigation, Autoplay, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    return {
      modules: [Navigation, Autoplay, A11y],
    }
  },
}
</script>

<style src="swiper/css" />
<style src="swiper/css/navigation" />
<style src="swiper/css/autoplay" />
<style scoped>
.swiper {
  position: absolute;
  z-index: 0;
}
</style>
<style>
.swiper-button-prev,
.swiper-button-next {
  color: #fff;
}
.swiper-button-prev::after,
.swiper-button-next::after {
  font-size: 1.2rem;
}
</style>
