<script lang="ts">
  import { onMount } from 'svelte'

  import { ClubsEvents, setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import type { Membership } from '@plugins/memberships'
  import { buildConfig } from '@devprotocol/clubs-core/events'

  export let currentPluginIndex: number
  export let memberships: Membership[]
  export let presets: Membership[]
  export let base: string = '/admin'
  export let clubName: string | undefined = undefined

  let updatingMembershipsStatus: Set<string> = new Set()

  const deleteMembership = (selectedMembership: Membership) => {
    updatingMembershipsStatus = new Set([
      ...updatingMembershipsStatus.values(),
      `${selectedMembership.id}:${selectedMembership.name}:${JSON.stringify(
        selectedMembership.payload
      )}`,
    ])
    const membership = memberships.find(
      (m: Membership) =>
        m.id === selectedMembership.id &&
        m.name === selectedMembership.name &&
        JSON.stringify(m.payload) === JSON.stringify(selectedMembership.payload)
    )

    setOptions(
      [
        {
          key: 'memberships',
          value: [
            ...memberships.filter(
              (m: Membership) => m.id !== selectedMembership.id
            ),
            { ...membership, deprecated: true },
          ],
        },
      ],
      currentPluginIndex
    )

    setTimeout(buildConfig, 50)
  }

  const activateMembership = (selectedMembership: Membership) => {
    updatingMembershipsStatus = new Set([
      ...updatingMembershipsStatus.values(),
      `${selectedMembership.id}:${selectedMembership.name}:${JSON.stringify(
        selectedMembership.payload
      )}`,
    ])

    const membership = memberships.find(
      (m: Membership) =>
        m.id === selectedMembership.id &&
        m.name === selectedMembership.name &&
        JSON.stringify(m.payload) === JSON.stringify(selectedMembership.payload)
    )

    setOptions(
      [
        {
          key: 'memberships',
          value: [
            ...memberships.filter(
              (m: Membership) => m.id !== selectedMembership.id
            ),
            { ...membership, deprecated: false },
          ],
        },
      ],
      currentPluginIndex
    )

    setTimeout(buildConfig, 50)
  }

  const presetExplanations = [
    {
      title: 'Community',
      desc: 'Influencers, YouTubers, photographers, musicians, and fans.',
    },
    {
      title: 'Team',
      desc: 'Creative groups of sound, movie, film, software, etc.',
    },
    {
      title: 'DAO',
      desc: 'Blockchains, social, public goods, etc.',
    },
  ]

  const getColStart = (i: number) =>
    i === 0
      ? 'lg:col-start-1'
      : i === 1
      ? 'lg:col-start-2'
      : i === 2
      ? 'lg:col-start-3'
      : i === 3
      ? 'lg:col-start-4'
      : i === 4
      ? 'lg:col-start-5'
      : i === 5
      ? 'lg:col-start-6'
      : i === 6
      ? 'lg:col-start-7'
      : i === 7
      ? 'lg:col-start-8'
      : 'lg:col-start-9'

  onMount(() => {
    document.body.addEventListener(
      ClubsEvents.FinishConfiguration,
      (ev: any) => {
        if (typeof ev.detail.success === 'boolean') {
          updatingMembershipsStatus = new Set()

          if (ev.detail.success) {
            window.location.reload()
          } else {
            // TODO: Add an error handling
          }
        }
      }
    )
  })
</script>

<div>
  {#if presets.length > 0}
    <div
      class="mb-16 grid max-w-5xl grid-cols-1 justify-between gap-4 lg:grid-cols-[repeat(3,_minmax(200px,_290px))]"
    >
      {#each presets as opt, i}
        <h3
          class={`mt-8 text-center text-2xl font-bold first:mt-0 lg:row-start-1 lg:mt-0 ${getColStart(
            i
          )}`}
        >
          {presetExplanations[i].title}
        </h3>
        <p class={`text-md lg:row-start-2 ${getColStart(i)}`}>
          {presetExplanations[i].desc}
        </p>
        <MembershipOptionCard
          clubName={clubName ?? 'Your Club'}
          id={opt.id}
          name={opt.name}
          imagePath={opt.imageSrc}
          ethPrice={opt.price.toString()}
          description={opt.description}
          className={`lg:row-start-3 ${getColStart(i)}`}
        />
        <a
          class={`hs-button is-filled is-fullwidth lg:row-start-4 ${getColStart(
            i
          )}`}
          id={`select-opt-${i}`}
          href={`${base}/memberships/new/${opt.id}`}
        >
          <span class="hs-button__label">Select</span>
        </a>
      {/each}
    </div>
  {/if}
  {#if memberships.length > 0}
    <h2 class="mb-8 text-2xl">Existing memberships</h2>
    <div
      class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-between gap-4"
    >
      {#each memberships as membership, i}
        <div>
          <MembershipOptionCard
            clubName={clubName ?? 'Your Club'}
            id={membership.id}
            name={membership.name}
            imagePath={membership.imageSrc}
            ethPrice={membership.price.toString()}
            description={membership.description}
          />
          <a
            class="hs-button is-filled is-fullwidth mt-4"
            id={`select-opt-${i}`}
            href={`${base}/memberships/${membership.id}`}
          >
            <span class="hs-button__label">Select</span>
          </a>
          {#if !membership.deprecated}
            <button
              disabled={updatingMembershipsStatus.has(
                `${membership.id}:${membership.name}:${JSON.stringify(
                  membership.payload
                )}`
              )}
              class={`hs-button is-filled is-fullwidth is-error mt-4 lg:row-start-4 ${getColStart(
                i
              )} ${
                updatingMembershipsStatus.has(
                  `${membership.id}:${membership.name}:${JSON.stringify(
                    membership.payload
                  )}`
                )
                  ? 'animate-pulse bg-gray-500/60'
                  : ''
              }`}
              id={`delete-opt-${i}`}
              on:click|preventDefault={() => deleteMembership(membership)}
            >
              <span class="hs-button__label">Delete</span>
            </button>
          {/if}
          {#if membership.deprecated}
            <button
              disabled={updatingMembershipsStatus.has(
                `${membership.id}:${membership.name}:${JSON.stringify(
                  membership.payload
                )}`
              )}
              class={`bg-dp-blue-grey-400 mt-2 block w-full rounded py-4 text-center text-sm font-semibold text-white lg:row-start-4 ${getColStart(
                i
              )} ${
                updatingMembershipsStatus.has(
                  `${membership.id}:${membership.name}:${JSON.stringify(
                    membership.payload
                  )}`
                )
                  ? 'animate-pulse bg-gray-500/60'
                  : ''
              }`}
              id={`activate-opt-${i}`}
              on:click|preventDefault={() => activateMembership(membership)}
              >Activate</button
            >
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
