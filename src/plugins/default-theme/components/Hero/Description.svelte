<script lang="ts">
  let open = false

  const onClick = () => {
    open = !open
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<section class="cursor-pointer lg:cursor-auto" on:click={onClick}>
  <p class={`overflow-hidden text-left lg:text-xl ${open ? '' : 'truncate'}`}>
    <slot />
  </p>
</section>
