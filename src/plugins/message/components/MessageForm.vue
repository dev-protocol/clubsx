<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data: () => ({
    fullname: '',
    addressLine1: '',
    addressLine2: '',
    zipCode: '',
    city: '',
    country: '',
  }),
  methods: {
    signAndSubmit() {
      // Logic here
    },
  },
})
</script>

<template>
  <form class="mb-12" @submit="signAndSubmit">
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="fullname">
        Full Name <span class="text-red-500">*</span></label
      >
      <input
        class="rounded bg-gray-700 px-8 py-4"
        v-model="fullname"
        id="fullname"
        name="fullname"
        placeholder="Full name"
        required
      />
    </div>
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="addressLine1">
        Address Line 1 <span class="text-red-500">*</span></label
      >
      <input
        class="rounded bg-gray-700 px-8 py-4"
        v-model="addressLine1"
        id="addressLine1"
        name="addressLine1"
        placeholder="Address Line 1"
        required
      />
    </div>
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="addressLine2">
        Address Line 2 <span class="text-red-500">*</span></label
      >
      <input
        class="rounded bg-gray-700 px-8 py-4"
        v-model="addressLine2"
        id="addressLine2"
        name="addressLine2"
        placeholder="Address Line 2"
        required
      />
    </div>
    <div class="mb-10 grid grid-cols-2 gap-x-4">
      <div class="flex flex-col">
        <label class="mb-1" for="zipCode">
          Zip / Postal Code <span class="text-red-500">*</span></label
        >
        <input
          class="rounded bg-gray-700 px-8 py-4"
          v-model="zipCode"
          id="zipCode"
          name="zipCode"
          placeholder="Zip / Postal Code"
          required
        />
      </div>
      <div class="flex flex-col">
        <label class="mb-1" for="city">
          City <span class="text-red-500">*</span></label
        >
        <input
          class="rounded bg-gray-700 px-8 py-4"
          v-model="city"
          id="city"
          name="city"
          placeholder="City"
          required
        />
      </div>
    </div>
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="country">
        Country <span class="text-red-500">*</span></label
      >
      <input
        class="rounded bg-gray-700 px-8 py-4"
        v-model="country"
        id="country"
        name="country"
        placeholder="Country"
        required
      />
    </div>
    <button
      type="submit"
      class="border-[##171717] rounded bg-[#D500E6] py-2 px-7"
    >
      Sign and Submit
    </button>
  </form>
</template>
