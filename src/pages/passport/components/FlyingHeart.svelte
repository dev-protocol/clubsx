<script lang="ts">
  import RedHeart from '@assets/emoji-red-heart.png'

  const random = () => 100 * Math.random() * 0.5
</script>

<div class="relative" style={`transform: translateX(${random()}%)`}>
  <img
    src={RedHeart.src}
    alt="Flying heart"
    class="absolute size-12 animate-[flyingHeart_2s_ease-in-out_forwards]"
  />
</div>

<style>
  @keyframes -global-flyingHeart {
    0% {
      transform: translateX(0) translateY(0);
      opacity: 100%;
    }
    25% {
      transform: translateX(-30%) translateY(-80%);
    }
    50% {
      transform: translateX(30%) translateY(-160%);
    }
    75% {
      transform: translateX(0) translateY(-240%);
    }
    100% {
      transform: translateY(-320%);
      opacity: 0%;
    }
  }
</style>
