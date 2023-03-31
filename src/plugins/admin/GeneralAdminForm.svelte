<script lang="ts">
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import { setConfig } from '@devprotocol/clubs-core'
  export let config: ClubsConfiguration

  let { name, description, twitterHandle, propertyAddress, adminRolePoints } =
    config
  let network = 'polygon'
  let dangerLocked = true
  const MAX_OF_ADMIN_ROLE_HOLDER_POINTS = 95
  const networkOptions = [
    { name: 'Mainnet', value: 'mainnet' },
    { name: 'Polygon', value: 'polygon' },
    { name: 'Arbitrum', value: 'arbitrum' },
    { name: 'Polygon Mumbai', value: 'polygon-mumbai' },
    { name: 'Arbitrum Rinkeby', value: 'arbitrum-rinkeby' },
  ]

  const updateConfig = () => {
    adminRolePoints =
      adminRolePoints > MAX_OF_ADMIN_ROLE_HOLDER_POINTS
        ? MAX_OF_ADMIN_ROLE_HOLDER_POINTS
        : adminRolePoints

    const updatedConfig = Object.assign(config, {
      name,
      description,
      twitterHandle,
      propertyAddress,
      adminRolePoints, // represented in basis points
    })
    setConfig(updatedConfig)
  }
</script>

<div>
  <div>
    <label class="hs-form-field is-filled is-required mb-10 flex flex-col">
      <span class="hs-form-field__label"> DAO Name </span>
      <input
        class="hs-form-field__input"
        bind:value={name}
        on:change={updateConfig}
        id="dao-name"
        name="dao-name"
      />
    </label>

    <label class="hs-form-field is-filled mb-10 flex flex-col">
      <span class="hs-form-field__label"> Description </span>
      <input
        class="hs-form-field__input"
        bind:value={description}
        on:change={updateConfig}
        id="description"
        name="description"
      />
    </label>

    <label class="hs-form-field is-filled is-required mb-10 flex flex-col">
      <span class="hs-form-field__label"> Editable Role Holder </span>
      <input
        class="hs-form-field__input w-fit"
        bind:value={adminRolePoints}
        on:change={updateConfig}
        id="roleHolder"
        name="roleHolder"
        type="number"
        min="0"
        max={MAX_OF_ADMIN_ROLE_HOLDER_POINTS}
      />
      <p class="mt-1 text-xs opacity-60">
        This value is the proportion of the tokens minted on Clubs required to
        edit this Club. Note that if you set a higher value than you have, you
        will be locked out.
      </p>
    </label>

    <label class="hs-form-field is-filled mb-10 flex flex-col">
      <span class="hs-form-field__label"> Twitter Handle </span>
      <input
        class="hs-form-field__input w-fit"
        bind:value={twitterHandle}
        on:change={updateConfig}
        id="twitter"
        name="twitter"
      />
    </label>

    <!-- Danger Zone-->
    <div class="rounded-lg border border-2 border-red-500 px-12 py-12">
      <div class="mb-10 flex items-center justify-between">
        <span class="font-title text-lg font-bold">Danger Zone</span>
        <button
          on:click|preventDefault={(_) => (dangerLocked = !dangerLocked)}
          class="rounded bg-[#040B10] px-8 py-4"
        >
          {#if dangerLocked}
            <span>Unlock</span>
          {:else}
            <span>Lock</span>
          {/if}
        </button>
      </div>

      <div class="mb-10 flex flex-col">
        <label class="mb-1" for="network">
          Network
          <span class="text-purple-400">*</span>
        </label>

        <select
          class={`rounded border border-2 border-[#040B10] px-8 py-4 ${
            dangerLocked ? 'bg-[#1E1E1E]' : 'bg-[#040B10]'
          }`}
          disabled={dangerLocked}
          bind:value={network}
          on:change={updateConfig}
          id="network"
          name="network"
        >
          {#each networkOptions as option}
            <option value={option.value}>
              {option.name}
            </option>
          {/each}
        </select>
      </div>

      <div class="flex flex-col">
        <label class="mb-1" for="tokenAddress">
          Token Address
          <span class="text-purple-400">*</span>
        </label>
        <input
          disabled={dangerLocked}
          class={`rounded border border-2 border-[#040B10] px-8 py-4 ${
            dangerLocked ? 'bg-[#1E1E1E]' : 'bg-[#040B10]'
          }`}
          bind:value={propertyAddress}
          on:change={updateConfig}
          id="tokenAddress"
          name="tokenAddress"
        />
      </div>
    </div>
  </div>
</div>
