<script lang="ts">
  export let title: string
  export let text: string
  export let url: string
  export let className: string | undefined = undefined

  const shareData = {
    title,
    text,
    url,
  }

  const handleClick = async () => {
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.error({ err })
    }
  }
</script>

<button on:click={handleClick} class={className ?? ''}><slot /></button>
