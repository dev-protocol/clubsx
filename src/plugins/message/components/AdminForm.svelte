<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import type { Membership } from '@plugins/memberships'
  import { ethers, utils } from 'ethers'
  import type { GatedMessage } from '../types'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'
  import { onMount } from 'svelte'

  export let currentPluginIndex: number
  export let forms: GatedMessage[] = []
  export let memberships: Membership[] = []
  export let id: string
  export let site: string
  let form: GatedMessage = forms.find((f) => f.id === id) ?? {
    id,
    title: '',
    description: '',
    requiredMembershipIds: [],
    presetName: 'PRESET_NAME_AND_FREE_INPUT',
    sendGridEnvKey: import.meta.env.PUBLIC_GATED_CONTACT_FORM_SENDGRID_ENV_KEY,
    destinationEmail: '',
  }
  let decryptedDestinationEmail: string | undefined = form.destinationEmail
    ? form.destinationEmail.includes('@') // Fallback to supports old option structure
      ? form.destinationEmail
      : undefined
    : ''

  const formPresets = [
    {
      label: 'Name and free input',
      value: 'PRESET_NAME_AND_FREE_INPUT',
    },
  ]

  let connection: typeof Connection
  let signer: ethers.Signer | undefined
  let currentAddress: string | undefined

  const connectOnMount = async () => {
    const _connection = await import('@devprotocol/clubs-core/connection')
    connection = _connection.connection
    connection().signer.subscribe((s) => {
      signer = s
    })
    connection().account.subscribe((a) => {
      currentAddress = a
    })
  }

  onMount(() => {
    connectOnMount()
  })

  const update = () => {
    if (decryptedDestinationEmail !== undefined) {
      // Always encrypt the email address if it is not already encrypted.
      return encryptEmail()
    }
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

  const encryptEmail = async () => {
    const res = await fetch('/api/encrypt', {
      method: 'POST',
      body: JSON.stringify({ text: decryptedDestinationEmail }),
    })

    if (res.ok) {
      const json = (await res.json()) as { encrypted: string }
      form.destinationEmail = json.encrypted

      decryptedDestinationEmail = undefined
      form = form
      update()
    }
  }

  const decryptEmail = async () => {
    if (!currentAddress || !signer) {
      return
    }

    const hash = utils.hashMessage(form.destinationEmail)
    const sig = await signer.signMessage(hash)
    if (!sig) {
      return
    }

    const res = await fetch('/api/decrypt', {
      method: 'POST',
      body: JSON.stringify({
        site,
        encryptedText: form.destinationEmail,
        hash,
        sig,
      }),
    })

    if (res.ok) {
      const json = (await res.json()) as { decoded: string }
      decryptedDestinationEmail = json.decoded
    }
  }
</script>

<form
  on:change|preventDefault={(_) => update()}
  class="flex flex-col justify-items-start gap-16"
>
  <!-- Email -->
  <div class="hs-form-field">
    <label class="hs-form-field__label" for="email"> Destination email</label>
    <div class="flex flex-row gap-4">
      {#if decryptedDestinationEmail !== undefined}
        <input
          class="hs-form-field__input grow"
          bind:value={decryptedDestinationEmail}
          name="email"
          type="email"
        />
        <button
          on:click|preventDefault={(_) => encryptEmail()}
          type="button"
          class="hs-button is-filled h-[initial] w-fit"
          >Encrypt this email</button
        >
      {:else}
        <input
          class="hs-form-field__input grow"
          bind:value={form.destinationEmail}
          name="email"
          disabled
        />
        <button
          class="hs-button is-filled h-[initial] w-fit"
          type="button"
          on:click|preventDefault={(_) => decryptEmail()}
          >Decrypt this email</button
        >
      {/if}
    </div>
  </div>

  <!-- Form preset -->
  <div class="flex flex-col items-start gap-1">
    <label class="hs-select-field">
      <span class="hs-select-field__label">Select</span>
      <select
        name="form-preset"
        bind:value={form.presetName}
        class="hs-select-field__input"
      >
        {#each formPresets as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>
    </label>
  </div>

  <!-- Title -->
  <label class="hs-form-field">
    <span class="hs-form-field__label"> Title </span>
    <input
      class="hs-form-field__input"
      bind:value={form.title}
      name="title"
      type="text"
    />
  </label>

  <!-- Description -->
  <label class="hs-form-field">
    <span class="hs-form-field__label"> Description </span>
    <textarea
      class="hs-form-field__input"
      bind:value={form.description}
      id="description"
      name="description"
    />
  </label>

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
