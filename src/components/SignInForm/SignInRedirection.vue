<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(async () => {
  const { connection } = await import('@devprotocol/clubs-core/connection')

  connection().account.subscribe((_account) => {
    console.log({ _account })
    if (_account) {
      window.location.href = new URL(
        `/passport/${_account}`,
        window.location.origin,
      ).toString()
    }
  })
})
</script>
