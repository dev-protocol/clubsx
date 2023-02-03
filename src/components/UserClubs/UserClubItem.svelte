<script lang="ts">
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'

  export let config: ClubsConfiguration
  export let isDraft: boolean

  const imagePath =
    (config.options?.find((option) => option.key === 'avatarImgSrc')
      ?.value as string) ?? ''

  const path = isDraft
    ? `/${config.name}/setup/basic`
    : `https://${config.name}.clubs.place`
</script>

<a
  href={path}
  class="item-shadow flex items-center justify-start gap-2.5 rounded-[5px] bg-white p-4 text-black"
>
  <div class="h-16 w-16 overflow-hidden rounded-full">
    <img class="w-full" src={imagePath || '/favicon.svg'} alt={config.name} />
  </div>
  <span class="font-body text-2xl font-bold text-black">{config.name}</span>
</a>

<style>
  .item-shadow {
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  }
</style>
