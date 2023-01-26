<script lang="ts">
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import { setConfig } from '@devprotocol/clubs-core'
  export let config: ClubsConfiguration

  let { name, description, twitterHandle, propertyAddress } = config
  let adminRolePoints = ''
  let network = 'polygon'
  let dangerLocked = true
  const networkOptions = [
    { name: 'Mainnet', value: 'mainnet' },
    { name: 'Polygon', value: 'polygon' },
    { name: 'Arbitrum', value: 'arbitrum' },
    { name: 'Polygon Mumbai', value: 'polygon-mumbai' },
    { name: 'Arbitrum Rinkeby', value: 'arbitrum-rinkeby' },
  ]

  const updateConfig = () => {
    const updatedConfig = Object.assign(config, {
      name,
      description,
      twitterHandle,
      propertyAddress,
    })
    setConfig(updatedConfig)
  }
</script>

<div>
  <div>
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="dao-name">
        DAO Name
        <span class="text-purple-400">*</span>
      </label>
      <input
        class="rounded bg-[#040B10] px-8 py-4"
        bind:value={name}
        on:change={updateConfig}
        id="dao-name"
        name="dao-name"
      />
    </div>

    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="description"> Description </label>
      <input
        class="rounded bg-[#040B10] px-8 py-4"
        bind:value={description}
        on:change={updateConfig}
        id="description"
        name="description"
      />
    </div>

    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="roleHolder">
        Editable Role Holder
        <span class="text-purple-400">*</span>
      </label>
      <input
        class="rounded bg-[#040B10] px-8 py-4"
        bind:value={adminRolePoints}
        on:change={updateConfig}
        id="roleHolder"
        name="roleHolder"
      />
    </div>

    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="twitter"> Twitter Handle </label>
      <input
        class="rounded bg-[#040B10] px-8 py-4"
        bind:value={twitterHandle}
        on:change={updateConfig}
        id="twitter"
        name="twitter"
      />
    </div>

    <!-- Danger Zone-->
    <div class="rounded-lg border border-2 border-red-500 py-12 px-12">
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
