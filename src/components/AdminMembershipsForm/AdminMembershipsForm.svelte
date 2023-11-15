<script lang="ts">
  import { onMount } from 'svelte'

  import { ClubsEvents, setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import type { Membership } from '@plugins/memberships'
  import { buildConfig } from '@devprotocol/clubs-core'

  export let currentPluginIndex: number
  export let memberships: Membership[] = []
  export let presets: Membership[]
  export let base: string = '/admin'
  export let clubName: string | undefined = undefined

  let updatingMembershipsStatus: Set<string> = new Set()

  const deleteMembership = (selectedMembership: Membership) => {
    updatingMembershipsStatus = new Set([
      ...updatingMembershipsStatus.values(),
      `${JSON.stringify(selectedMembership.payload)}`,
    ])
    const membership = memberships.find(
      (m: Membership) =>
        JSON.stringify(m.payload) ===
        JSON.stringify(selectedMembership.payload),
    )

    if (!membership) {
      return
    }

    setOptions(
      [
        {
          key: 'memberships',
          value: [
            ...memberships.filter((m: Membership) => m.id !== membership.id),
            { ...selectedMembership, deprecated: true },
          ],
        },
      ],
      currentPluginIndex,
    )

    setTimeout(buildConfig, 50)
  }

  const activateMembership = (selectedMembership: Membership) => {
    updatingMembershipsStatus = new Set([
      ...updatingMembershipsStatus.values(),
      `${JSON.stringify(selectedMembership.payload)}`,
    ])

    const membership = memberships.find(
      (m: Membership) =>
        JSON.stringify(m.payload) ===
        JSON.stringify(selectedMembership.payload),
    )

    if (!membership) {
      return
    }

    setOptions(
      [
        {
          key: 'memberships',
          value: [
            ...memberships.filter((m: Membership) => m.id !== membership.id),
            { ...selectedMembership, deprecated: false },
          ],
        },
      ],
      currentPluginIndex,
    )

    setTimeout(buildConfig, 50)
  }

  const presetExplanations = [
    {
      title: 'Creator',
      desc: 'Start a subscription for your lessons, contents, experiences, and more.',
      example: {
        clubs: 'https://my-vlog.clubs.place/',
        name: 'My Vlog',
        avatar: 'https://i.imgur.com/195I7Ch.png',
        cover: 'https://i.imgur.com/WihEmii.jpg',
      },
    },
    {
      title: 'Business',
      desc: 'Provide special offers to members/non-members.',
      example: {
        clubs: 'https://hotel.clubs.place/',
        name: 'Clubs Hotel',
        avatar: 'https://i.imgur.com/lWwQnRl.jpg',
        cover: 'https://i.imgur.com/hDBx7VD.jpg',
      },
    },
    {
      title: 'Public',
      desc: 'Start a co-creation project and invite members.',
      example: {
        clubs: 'https://public.clubs.place/',
        name: 'Public Project',
        avatar: 'https://i.imgur.com/j4TDkTr.png',
        cover: 'https://i.imgur.com/iKw1D0X.jpg',
      },
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
      },
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
            i,
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
          price={opt.price.toString()}
          currency={opt.currency}
          description={opt.description}
          className={`lg:row-start-3 ${getColStart(i)}`}
        />
        <a
          class={`hs-button is-filled is-fullwidth lg:row-start-4 ${getColStart(
            i,
          )}`}
          id={`select-opt-${i}`}
          href={`${base}/memberships/new/${opt.id}`}
        >
          <span class="hs-button__label">Select</span>
        </a>
        {#if presetExplanations[i].example}
          <div class={`flex flex-col gap-4 lg:row-start-5 ${getColStart(i)}`}>
            <a
              class="flex gap-2 rounded-md shadow overflow-hidden items-center bg-dp-blue-grey-400 scale-90 hover:scale-100 transition duration-300 brightness-100 hover:brightness-110"
              href={presetExplanations[i].example?.clubs}
              target="_blank"
              rel="noopener"
            >
              <div class="relative flex items-center justify-end w-28 h-28">
                <img
                  src={presetExplanations[i].example?.cover}
                  role="presentation"
                  class="absolute w-full h-full object-cover"
                  alt={`Cover of ${presetExplanations[i].example?.name}`}
                />
                <img
                  src={presetExplanations[i].example?.avatar}
                  role="presentation"
                  class="relative -mr-8 w-16 h-16 object-cover rounded-full"
                  alt={`Avatar of ${presetExplanations[i].example?.name}`}
                />
              </div>
              <div class="p-2 pl-10">
                <span
                  class="px-2 rounded bg-dp-white-600 text-dp-black-200 text-xs"
                  >Example</span
                >
                <p class="font-bold">
                  {presetExplanations[i].example?.name}
                </p>
              </div>
            </a>
          </div>
        {/if}
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
            price={membership.price.toString()}
            currency={membership.currency}
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
                `${JSON.stringify(membership.payload)}`,
              )}
              class={`hs-button is-filled is-fullwidth is-error mt-4 lg:row-start-4 ${getColStart(
                i,
              )} ${
                updatingMembershipsStatus.has(
                  `${JSON.stringify(membership.payload)}`,
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
                `${JSON.stringify(membership.payload)}`,
              )}
              class={`mt-2 block w-full rounded bg-dp-blue-grey-400 py-4 text-center text-sm font-semibold text-white lg:row-start-4 ${getColStart(
                i,
              )} ${
                updatingMembershipsStatus.has(
                  `${JSON.stringify(membership.payload)}`,
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
