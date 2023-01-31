<script lang="ts">
  let open = false

  const onClick = () => {
    open = !open
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<section class="cursor-pointer lg:cursor-auto" on:click={onClick}>
  <p class={`overflow-hidden text-left lg:text-xl ${open ? '' : 'close'}`}>
    <slot />
  </p>
</section>

<style>
  .close {
    display: box;
    box-orient: vertical;
    line-clamp: 3;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
  @media (min-width: 890px) {
    .close {
      display: block;
    }
  }
</style>
