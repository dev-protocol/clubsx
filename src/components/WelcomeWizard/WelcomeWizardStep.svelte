<script lang="ts">
  export let label: string
  export let isActive: boolean
  export let link: string
</script>

<a href={link} class={`flex flex-row w-full p-3 -mx-3 rounded transition-colors duration-500 gap-4 text-white ${isActive ? 'border' : 'hover:bg-white/30'}`}>
  <i role="presentation" class={`${isActive ? '' : 'opacity-50'}`}><slot /></i>
  <span class="font-bold">{label}</span>
</a>
