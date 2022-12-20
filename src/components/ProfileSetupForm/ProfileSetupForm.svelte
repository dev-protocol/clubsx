<script lang="ts">
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

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (!e.currentTarget.files) {
      return
    }

    const file = e.currentTarget.files[0]

    avatarPath = await uploadImageAndGetPath(file)
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

<form on:change|preventDefault={(e) => update()}>
  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="club-name">
      Club Name
      <span class="text-purple-400">*</span>
    </label>
    <input
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={name}
      id="club-name"
      name="club-name"
    />
  </div>

  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="project-category">
      Project Category
      <span class="text-purple-400">*</span>
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

  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="twitter-handle"> Twitter Handle </label>
    <input
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={twitterHandle}
      id="twitter-handle"
      name="twitter-handle"
    />
  </div>

  <div class="mb-10 flex flex-col">
    <label class="mb-1 flex flex-col" for="avatarPath">
      <span class="mb-1">Avatar</span>

      {#if avatarPath && avatarPath != ''}
        <input
          class="rounded bg-[#040B10] px-8 py-4"
          bind:value={avatarPath}
          id={`avatar`}
          name={`avatar`}
        />
      {:else}
        <div class="float-left">
          <span
            class="cursor-pointer rounded-lg bg-[#040B10] px-12 py-4 text-sm font-medium"
            type="button">Choose Image</span
          >
        </div>
      {/if}
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
