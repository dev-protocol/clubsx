<script lang="ts">
  import WelcomeWizardStep from './WelcomeWizardStep.svelte'
  import IconClubs from './icons/clubs.svelte'
  import IconIdentification from './icons/identification.svelte'
  import IconComputerDesktop from './icons/computer-desktop.svelte'
  import IconUserGroup from './icons/user-group.svelte'
  import IconGlobeEuropeAfrica from './icons/globe-europe-africa.svelte'
  import IconArrowBottom from './icons/arrow-bottom.svelte'

  export let step: 'DESIGN' | 'MEMBERSHIPS' | 'PREVIEW' | 'PROFILE' | 'PUBLISH'
</script>

<div
  class={`relative grid h-full content-start gap-16 bg-[url('/assets/bg-wizard.jpg')] bg-cover bg-center bg-no-repeat	py-16	px-8`}
>
  <div role="presentation" class="absolute inset-0 bg-black/30" />
  <h1 class="relative flex items-center gap-2">
    <IconClubs />
    <span class="font-['Poppins']">Clubs</span>
  </h1>
  <div class="relative grid gap-4	">
    <WelcomeWizardStep
      label="Basic info"
      isActive={step === 'PROFILE'}
      link="/setup/profile"
    >
      <IconIdentification />
    </WelcomeWizardStep>

    <IconArrowBottom />

    <WelcomeWizardStep
      label="Design"
      isActive={step === 'DESIGN'}
      link="/setup/homepage"
    >
      <IconComputerDesktop />
    </WelcomeWizardStep>

    <IconArrowBottom />

    <WelcomeWizardStep
      label="Memberships"
      isActive={step === 'MEMBERSHIPS'}
      link="/setup/memberships"
    >
      <IconUserGroup />
    </WelcomeWizardStep>

    <IconArrowBottom />

    <WelcomeWizardStep
      label="Preview"
      isActive={step === 'PREVIEW'}
      link="/setup/preview"
    >
      <IconComputerDesktop />
    </WelcomeWizardStep>

    <IconArrowBottom />

    <WelcomeWizardStep
      label="Publish"
      isActive={step === 'PUBLISH'}
      link="/setup/publish"
    >
      <IconGlobeEuropeAfrica />
    </WelcomeWizardStep>
  </div>
</div>
