<script lang="ts">
  let checked = false
  let formListener: (ev: Event) => void

  const handler = (trigger: Event, parent: HTMLElement) => (ev: Event) => {
    if (trigger.target !== ev.target) {
      checked = false
      parent.removeEventListener('change', formListener)
    }
  }

  const onClick = (ev: Event) => {
    checked = true
    const parent = (ev.target as HTMLElement).closest('form')
    if (!parent) return
    formListener = handler(ev, parent)
    parent.addEventListener('change', formListener)
  }
</script>

<label
  class={`flex items-center gap-2 rounded border p-8 py-4 ${
    checked ? 'border-native-blue-400' : 'border-white/20'
  }`}
>
  <input type="radio" name="input" value="yen" on:click={onClick} />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="h-8 w-8"
  >
    <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z"></path>
    <path
      fill-rule="evenodd"
      d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
      clip-rule="evenodd"
    ></path>
  </svg>

  <span class="font-bold">Credit Card (YEN)</span>
</label>
