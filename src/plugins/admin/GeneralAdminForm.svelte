<script lang="ts">
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import { setConfig } from '@devprotocol/clubs-core'
  export let config: ClubsConfiguration

  let { name, description, twitterHandle, propertyAddress, adminRolePoints } =
    config
  const MAX_OF_ADMIN_ROLE_HOLDER_POINTS = 95

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
      <span class="hs-form-field__helper">
        This value is the proportion of the tokens minted on Clubs required to
        edit this Club. Note that if you set a higher value than you have, you
        will be locked out.
      </span>
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
  </div>
</div>
