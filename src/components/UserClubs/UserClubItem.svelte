<script lang="ts">
  import { ClubsConfiguration } from '@devprotocol/clubs-core'

  export let config: ClubsConfiguration

  const imagePath =
    (config.options?.find((option) => option.key === 'avatarImgSrc')
      ?.value as string) ?? ''
</script>

<div class="flex items-center rounded bg-white py-2 px-4 text-black">
  <div class="h-16 w-16 overflow-hidden rounded-full">
    <img class="w-full" src={imagePath} alt={config.name} />
  </div>

  <span class="ml-4 font-bold">{config.name}</span>
</div>
