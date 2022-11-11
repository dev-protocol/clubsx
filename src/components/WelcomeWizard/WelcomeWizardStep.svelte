<script lang="ts">
  export let label: string
  export let isActive: boolean
  export let isComplete: boolean

  const isActiveClass = 'font-bold underline'
</script>

<div class={`mb-4 flex flex-row text-white ${isActive ? isActiveClass : ''}`}>
  {#if isComplete}
    <span>✅</span>
  {:else}
    <span>☑️</span>
  {/if}
  <span>{label}</span>
</div>
