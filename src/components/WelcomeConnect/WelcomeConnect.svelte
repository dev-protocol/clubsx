<script lang="ts">

  let email = '';

  const sendMagicLink = async () => {}

  const walletConnect = async () => {}

</script>

<div class="flex flex-col items-center">

  <section class="mb-8 pb-8 mt-8 border-b-2 border-gray-400">

    <div class="flex items-center">

      <div class="mr-2">
        <input
          bind:value={email}
          id="email"
          name="email"
          type="email"
          placeholder="Your email"
          class="rounded bg-gray-700 py-3 px-4 w-64 text-right"
        />
      </div>

      <button on:click|preventDefault={(_) => sendMagicLink()} class="text-sm bg-blue-500 px-4 rounded-xl py-3 px-6">Send Magic Link</button>

    </div>

  </section>

  <div class="flex flex-col items-center">

    <span class="text-sm text-gray-400 mb-4">Already have a wallet?</span>

    <button
      class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl py-3 px-6"
      on:click|preventDefault={(_) => walletConnect()}
    >
      Sign with your wallet
    </button>

  </div>

</div>
