<script setup lang="ts">
const props = defineProps({
  show: Boolean,
})
</script>

<template>
  <Transition name="modal">
    <div
      v-if="props.show"
      class="modal-mask fixed items-center top-0 left-0 w-full h-full flex bg-black/50"
      @click="$emit('close')"
    >
      <div
        class="modal-container mx-auto h-fit p-8 lg:px-14 bg-black rounded-2xl w-fit max-w-md shadow grid gap-6 border-x border-t border-dp-blue-grey-300"
        @click.stop=""
      >
        <slot name="body"></slot>

        <div class="modal-footer">
          <slot name="footer">
            <button
              class="float-right hs-button is-outlined"
              @click="$emit('close')"
            >
              Close
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
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
  -webkit-transform: translateY(30px);
  transform: translateY(30px);
}
</style>
