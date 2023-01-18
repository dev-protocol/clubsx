<script lang="ts">
  import Skeleton from '@components/Global/Skeleton.svelte'
  import { DraftOptions } from '@constants/draft'
  import { ClubsConfiguration, setConfig } from '@devprotocol/clubs-core'
  import { UndefinedOr } from '@devprotocol/util-ts'
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
  let avatarPath =
    config.options?.find((opt) => opt.key === 'avatarImgSrc')?.value ?? ''
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
    update()
  }

  const update = async () => {
    if (!config.options) {
      config = Object.assign({}, config, { options: [] })
    }

    const sourceDraft = (config.options?.find(
      (opt) => opt.key === '__draft'
    ) as UndefinedOr<DraftOptions>) ?? { key: '__draft', value: {} }

    const avatarImgSrc = {
      key: 'avatarImgSrc',
      value: avatarPath ?? '',
    }
    const __draft = {
      ...sourceDraft,
      value: {
        ...sourceDraft.value,
        category: projectCategory,
      },
    }
    const options = [
      ...(config.options?.filter(
        ({ key }) => key !== 'avatarImgSrc' && key !== '__draft'
      ) ?? []),
      avatarImgSrc,
      __draft,
    ]

    config = { ...config, name, twitterHandle, options }

    setConfig(config)
  }
</script>

<form on:change|preventDefault={(e) => update()} class="grid gap-16">
  <label class="hs-form-field is-filled is-required">
    <span class="hs-form-field__label"> Club Name </span>
    <input
      class="hs-form-field__input min-w-full max-w-full"
      bind:value={name}
      id="club-name"
      name="club-name"
    />
  </label>

  <label class="hs-select-field is-filled is-required">
    <span class="hs-select-field__label"> Project Category </span>
    <select
      bind:value={projectCategory}
      id="project-category"
      name="project-category"
      class="hs-select-field__input"
    >
      {#each projectCategories as cat}
        <option value={cat.value}>{cat.label}</option>
      {/each}
    </select>
  </label>

  <label class="hs-form-field is-filled">
    <span class="hs-form-field__label"> Twitter Handle </span>
    <input
      class="hs-form-field__input min-w-full max-w-full"
      bind:value={twitterHandle}
      id="twitter-handle"
      name="twitter-handle"
    />
  </label>

  <div class="flex flex-col items-start gap-1">
    <label class="hs-form-field" for="avatarPath">
      <span class="hs-form-field__label">Avatar</span>

      {#if avatarUploading}
        <div class="h-64 w-64"><Skeleton /></div>
      {:else if avatarPath && avatarPath != ''}
        <div class="w-64 rounded bg-dp-blue-grey-600 p-3">
          <img src={avatarPath} class="rounded" alt="" />
        </div>
      {/if}
      <div class="float-left">
        <span class="hs-button is-filled is-large cursor-pointer" type="button"
          >Choose Image</span
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
