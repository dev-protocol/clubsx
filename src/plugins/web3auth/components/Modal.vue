<script setup lang="ts">
const props = defineProps({
  show: Boolean,
})
</script>

<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="modal-mask fixed top-0 left-0 w-full h-full flex bg-black/50"
    >
      <div class="modal-container mx-auto p-8 bg-black rounded-md w-80 shadow">
        <div class="mx-5">
          <slot name="body"></slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            <button class="float-right" @click="$emit('close')">Close</button>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  z-index: 9998;
  transition: opacity 0.3s ease;
}

.modal-container {
  transition: all 0.3s ease;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
