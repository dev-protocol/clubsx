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
  justify-content: center;
  align-items: center;
}

@media (min-width: 1024px) {
  .modal-container {
    align-items: center;
  }
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
  transition: transform 600ms cubic-bezier(0.07, 1.28, 0.5, 1);
}

.v-leave-active {
  transition: transform 600ms linear;
}

.v-enter-from {
  transform: translate(0, 100%);
}

.v-leave-to {
  transform: translate(0, 0);
}

html:has(#modal-container[data-active='true']) {
  overflow: hidden;
}
</style>

<template>
  <Teleport to="body">
    <div
      v-show="isVisible"
      id="modal-container"
      :data-active="isVisible"
      class="modal-container z-30"
    >
      <div
        @click="
          () => {
            handleModalClose()
          }
        "
        class="fixed top-0 bottom-0 left-0 right-0 overflow-y-auto py-6 flex justify-center items-center backdrop-blur-md bg-black/30 z-50"
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
  </Teleport>
</template>
