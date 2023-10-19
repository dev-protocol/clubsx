import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionGetSlots,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as ID } from './[id].astro'
import { default as Admin } from './pages/Admin.astro'
import { default as AdminNew } from './pages/AdminNew.astro'
import { default as AdminEdit } from './pages/AdminEdit.astro'
import { default as RemoveButton } from './components/RemoveButton.astro'
import { default as AddNavigationLink } from '@components/AddNavigationLink/AddNavigationLink.astro'
import type { GatedMessage } from './types'
import type { UndefinedOr } from '@devprotocol/util-ts'
import type { Membership } from '@plugins/memberships'
import { v5 as uuidv5 } from 'uuid'
import type { NavLink } from '@constants/navLink'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/message-1.jpg'
import Preview2 from './assets/message-2.jpg'
import Preview3 from './assets/message-3.jpg'
import { randomBytes } from 'ethers'

export const getPagePaths = (async (
  options,
  { propertyAddress },
  { getPluginConfigById },
) => {
  const forms =
    (options.find((opt) => opt.key === 'forms')?.value as UndefinedOr<
      GatedMessage[]
    >) ?? []
  const [membershipConfig, membershipPluginIndex] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships',
  )
  const memberships =
    (membershipConfig?.options.find((opt) => opt.key === 'memberships')
      ?.value as UndefinedOr<Membership[]>) ?? []
  const [, pluginIndex] = getPluginConfigById(
    'devprotocol:clubs:gated-contact-form',
  )

  return [
    {
      paths: ['message'],
      component: Index,
      props: { forms, memberships },
    },
    ...forms.map((form) => {
      const requiredMemberships = memberships.filter((mem) =>
        form.requiredMembershipIds.includes(mem.id),
      )
      return {
        paths: ['message', String(form.id)],
        component: ID,
        props: {
          propertyAddress,
          form,
          requiredMemberships,
          pluginIndex,
          membershipPluginIndex,
        },
      }
    }),
  ]
}) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (
  options,
  { url },
  { getPluginConfigById },
) => {
  const forms =
    (options.find((opt) => opt.key === 'forms')?.value as UndefinedOr<
      GatedMessage[]
    >) ?? []
  const [membershipConfig] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships',
  )
  const memberships =
    (membershipConfig?.options.find((opt) => opt.key === 'memberships')
      ?.value as UndefinedOr<Membership[]>) ?? []

  const namespace = uuidv5(url, uuidv5.URL)
  const uuid = uuidv5(randomBytes(32), namespace)

  return [
    {
      paths: ['gated-form'],
      component: Admin,
      props: {
        forms,
        memberships,
      },
    },
    {
      paths: ['gated-form', 'new'],
      component: AdminNew,
      props: { forms, memberships, id: uuid },
    },
    ...(forms?.map((form) => ({
      paths: ['gated-form', form.id],
      component: AdminEdit,
      props: {
        forms,
        memberships,
        id: form.id,
      },
    })) ?? []),
  ]
}) satisfies ClubsFunctionGetAdminPaths

export const getSlots = (async (options, config, { paths, factory }) => {
  const forms =
    (options.find((opt) => opt.key === 'forms')?.value as UndefinedOr<
      GatedMessage[]
    >) ?? []
  const [path1, id] = paths
  return factory === 'admin' && path1 === 'gated-form' && id
    ? [
        {
          slot: 'admin:aside:after-built-in-buttons',
          component: RemoveButton,
          props: {
            forms,
            id,
          },
        },
      ]
    : factory === 'admin' && path1 === 'gated-form'
    ? [
        {
          slot: 'admin:aside:after-built-in-buttons',
          component: AddNavigationLink,
          props: {
            forAddNavigationLink: {
              config,
              label: `Add 'Contact form' to the menu`,
              link: {
                display: 'Contact form',
                path: '/message',
              } as NavLink,
            },
          },
        },
      ]
    : []
}) satisfies ClubsFunctionGetSlots

export const meta = {
  id: 'devprotocol:clubs:gated-contact-form',
  displayName: 'Contact form',
  category: ClubsPluginCategory.Growth,
  icon: Icon.src,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Token-gated contact form.`,
  previewImages: [Preview1.src, Preview2.src, Preview3.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  getSlots,
  meta,
} satisfies ClubsFunctionPlugin
