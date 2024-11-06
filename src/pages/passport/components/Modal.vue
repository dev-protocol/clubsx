<script setup lang="ts">
defineProps<{
  modalContent: any
  isVisible: boolean
  handleModalClose: () => void
  attrs: { [key: string]: any }
}>()
</script>

<style>
.modal-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (min-width: 1024px) {
  .modal-container {
    align-items: center;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: -1;
}

.modal-content {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
}

@media (min-width: 1024px) {
  .modal-content {
  }
}

.v-enter-active {
  transition: opacity 0.2s ease;
}

.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from {
  opacity: 0;
}

.v-leave-to {
  opacity: 0;
}

html:has(#modal-container[data-active='true']) {
  overflow: hidden;
}
</style>

<template>
  <div
    v-show="isVisible"
    id="modal-container"
    :data-active="isVisible"
    class="modal-container z-50"
  >
    <div
      @click="
        () => {
          handleModalClose()
        }
      "
      class="modal-overlay overflow-y-auto py-6 flex justify-center"
    >
      <Transition>
        <component v-show="isVisible" :is="modalContent" v-bind="attrs">
          <template #after:description>
            <slot name="after:description" />
          </template>
        </component>
      </Transition>
    </div>
  </div>
</template>
