<script lang="ts">
  export let label: string
  export let isActive: boolean
  export let link: string
  export let dataAstroReload: boolean | undefined = undefined
</script>

<a
  href={link}
  rel="prefetch"
  data-astro-reload={dataAstroReload}
  class={`-mx-3 flex w-full flex-row gap-4 rounded p-3 text-white transition-colors duration-500 ${
    isActive ? 'border' : 'hover:bg-white/30'
  }`}
>
  <i role="presentation" class={`${isActive ? '' : 'opacity-50'}`}><slot /></i>
  <span class="font-bold">{label}</span>
</a>
