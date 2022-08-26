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
      ><img :src="images.cover1" class="h-full w-full object-cover opacity-80"
    /></swiper-slide>
    <swiper-slide
      ><img
        :src="images.cover2"
        class="opacity-8 h-full w-full object-cover opacity-80"
    /></swiper-slide>
    <swiper-slide
      ><img :src="images.cover3" class="h-full w-full object-cover opacity-80"
    /></swiper-slide>
  </swiper>
</template>

<script>
import cover1 from '@assets/cover-1.jpg'
import cover2 from '@assets/cover-2.jpg'
import cover3 from '@assets/cover-3.jpg'
import { Navigation, Autoplay, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      images: {
        cover1,
        cover2,
        cover3,
      },
    }
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
