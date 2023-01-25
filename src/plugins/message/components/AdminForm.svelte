<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import type { Membership } from '@plugins/memberships'
  import type { GatedMessage } from '../types'

  export let currentPluginIndex: number
  export let forms: GatedMessage[] = []
  export let memberships: Membership[] = []
  export let id: string
  let form: GatedMessage = forms.find((f) => f.id === id) ?? {
    id,
    title: '',
    description: '',
    requiredMembershipIds: [],
    presetName: 'PRESET_NAME_AND_FREE_INPUT',
    sendGridEnvKey: '',
    destinationEmail: '',
  }

  const formPresets = [
    {
      label: 'Name and free input',
      value: 'PRESET_NAME_AND_FREE_INPUT',
    },
  ]

  const update = () => {
    const next = forms.some((form) => form.id === id)
      ? // If the ID is already exists, override it. This is a safeguard to avoid duplicate data.
        forms.map((form) => (form.id === id ? form : form))
      : // If not, add it.
        [...forms, form]
    forms = next

    setOptions([{ key: 'forms', value: forms }], currentPluginIndex)
  }

  const remove = () => {
    setOptions(
      [{ key: 'forms', value: forms.filter((f) => f.id !== id) }],
      currentPluginIndex
    )
  }
</script>

<form
  on:change|preventDefault={(_) => update()}
  class="flex flex-col justify-items-start gap-16"
>
  <!-- Email -->
  <div class="flex flex-col gap-1">
    <label for="email"> Destination email </label>
    <input
      class="max-w-sm rounded	bg-[#040B10] px-8 py-4"
      bind:value={form.destinationEmail}
      name="email"
      type="email"
    />
  </div>

  <!-- Form preset -->
  <div class="flex flex-col items-start gap-1">
    <label for="form-preset"> Form preset </label>
    <select
      bind:value={form.presetName}
      name="form-preset"
      class="rounded bg-[#040B10] px-8 py-4"
    >
      {#each formPresets as cat}
        <option value={cat.value}>{cat.label}</option>
      {/each}
    </select>
  </div>

  <!-- Title -->
  <div class="flex flex-col gap-1">
    <label for="title"> Title </label>
    <input
      class="max-w-sm rounded bg-[#040B10] px-8 py-4"
      bind:value={form.title}
      name="title"
      type="text"
    />
  </div>

  <!-- Description -->
  <div class="flex flex-col">
    <label for="description"> Description </label>
    <textarea
      class="w-full rounded bg-[#040B10] px-8 py-4"
      bind:value={form.description}
      id="description"
      name="description"
    />
  </div>

  <!-- Required memberships -->
  <div class="flex flex-col items-start gap-1">
    <label for="required-memberships"> Required memberships </label>
    <div
      class="grid w-full grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-between gap-6"
    >
      {#each memberships as mem}
        <label>
          <input
            type="checkbox"
            bind:group={form.requiredMembershipIds}
            name="requiredMembershipId"
            value={mem.id}
            class="hidden"
            checked={form.requiredMembershipIds.includes(mem.id)}
          />
          <div
            class={`flex flex-col gap-3 rounded bg-white p-2.5 text-black ${
              form.requiredMembershipIds.includes(mem.id) &&
              'shadow-[0_0_0_6px_rgba(91,139,245,1)]'
            }`}
          >
            <span class="font-semibold">{mem.name}</span>
            <img
              class="aspect-square w-full"
              src={mem.imageSrc}
              alt={`${mem.name} Membership`}
            />
            <span class="font-semibold"
              >{mem.price} {mem.currency.toUpperCase()}</span
            >
            <span class="text-sm">{mem.description}</span>
          </div>
        </label>
      {/each}
    </div>
  </div>
</form>
