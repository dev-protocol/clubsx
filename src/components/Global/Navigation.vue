<template>
  <div id="app">
    <Navbar tenantName={tenantName} />
  </div>
</template>

<script lang="ts">
import Navbar from '@components/Global/Navbar.vue'
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  name: 'app',
  props: {
    tenantName: String,
  },
  components: {
    Navbar,
  }
})
</script>
