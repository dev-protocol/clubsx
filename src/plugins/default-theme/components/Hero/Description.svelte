<script lang="ts">
  let open = false

  const onClick = () => {
    console.log({ open })
    open = !open
  }
</script>

<button on:click={onClick}>
  <p
    class={`overflow-hidden text-left ${
      open ? '' : 'close h-[10ex] lg:h-[30ex]'
    }`}
  >
    <slot />
  </p>
</button>

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
      line-clamp: 10;
      -webkit-line-clamp: 10;
    }
  }
</style>
