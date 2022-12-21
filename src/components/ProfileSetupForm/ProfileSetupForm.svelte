<script lang="ts">
  import Skeleton from '@components/Global/Skeleton.svelte'
  import { ClubsConfiguration, setConfig } from '@devprotocol/clubs-core'
  import { uploadImageAndGetPath } from '@fixtures/imgur'

  export let config: ClubsConfiguration

  let { name, twitterHandle } = config

  const projectCategories = [
    {
      label: 'YouTube',
      value: 'YOUTUBE',
    },
    {
      label: 'GitHub',
      value: 'GITHUB',
    },
    {
      label: 'Discord',
      value: 'DISCORD',
    },
  ]
  let projectCategory = 'GITHUB'
  let avatarPath = ''
  let avatarUploading = false

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (!e.currentTarget.files) {
      return
    }

    avatarUploading = true

    const file = e.currentTarget.files[0]

    avatarPath = await uploadImageAndGetPath(file)

    avatarUploading = false
  }

  const update = async () => {
    if (!config.options) {
      config = Object.assign({}, config, { options: [] })
    }

    const draftOptions =
      config.options?.find((opt) => opt.key === '__draft') ?? {}

    const options = [
      {
        key: 'avatarImgSrc',
        value: avatarPath ?? '',
      },
      {
        key: '__draft',
        value: Object.assign({}, draftOptions, { category: projectCategory }),
      },
    ]

    config = Object.assign({}, config, { name, twitterHandle, options })

    setConfig(config)
  }
</script>

<form on:change|preventDefault={(e) => update()} class="grid gap-16">
  <div class="flex flex-col items-start gap-1">
    <label for="club-name">
      Club Name
      <span class="text-plox-200">*</span>
    </label>
    <input
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={name}
      id="club-name"
      name="club-name"
      size="50"
    />
  </div>

  <div class="flex flex-col items-start gap-1">
    <label for="project-category">
      Project Category
      <span class="text-plox-200">*</span>
    </label>
    <select
      bind:value={projectCategory}
      id="project-category"
      name="project-category"
      class="rounded bg-[#040B10] px-8 py-4"
    >
      {#each projectCategories as cat}
        <option value={cat.value}>{cat.label}</option>
      {/each}
    </select>
  </div>

  <div class="flex flex-col items-start gap-1">
    <label for="twitter-handle"> Twitter Handle </label>
    <input
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={twitterHandle}
      id="twitter-handle"
      name="twitter-handle"
      size="50"
    />
  </div>

  <div class="flex flex-col items-start gap-1">
    <label class="flex flex-col items-start gap-1" for="avatarPath">
      <span>Avatar</span>

      {#if avatarUploading}
        <div class="h-64 w-64"><Skeleton /></div>
      {:else if avatarPath && avatarPath != ''}
        <div class="w-64 rounded bg-dp-blue-grey-600 p-3">
          <img src={avatarPath} class="rounded" alt="" />
        </div>
      {/if}
      <div class="float-left">
        <span
          class="hs-button is-filled cursor-pointer border-0 bg-[#040B10] px-12 py-4 text-sm font-medium text-inherit"
          type="button">Choose Image</span
        >
      </div>
      <input
        id="avatarPath"
        name="avatarPath"
        style="display:none"
        type="file"
        on:change={onFileSelected}
      />
    </label>
  </div>
</form>
