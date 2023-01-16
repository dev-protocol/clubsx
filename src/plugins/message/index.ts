import {
  ClubsConfiguration,
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as ID } from './[id].astro'
import { default as Admin } from './pages/Admin.astro'
import { default as AdminNew } from './pages/AdminNew.astro'
import { default as AdminEdit } from './pages/AdminEdit.astro'
import { default as RemoveButton } from './components/RemoveButton.astro'
import { GatedMessage } from './types'
import { UndefinedOr } from '@devprotocol/util-ts'
import { Membership } from '@plugins/memberships'
import uniqueString from 'unique-string'

const getMemberships = (plugins: ClubsConfiguration['plugins']) => {
  const memberships =
    (plugins
      .find((plg) => plg.name === 'memberships')
      ?.options.find((opt) => opt.key === 'memberships')?.value as UndefinedOr<
      Membership[]
    >) ?? []
  return memberships
}

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { propertyAddress, plugins }
) => {
  const forms =
    (options.find((opt) => opt.key === 'forms')?.value as UndefinedOr<
      GatedMessage[]
    >) ?? []
  const memberships = getMemberships(plugins)

  return [
    {
      paths: ['message'],
      component: Index,
      props: { forms },
    },
    ...forms.map((form) => {
      const requiredMemberships = memberships.filter((mem) =>
        form.requiredMembershipIds.includes(mem.id)
      )
      return {
        paths: ['message', String(form.id)],
        component: ID,
        props: { propertyAddress, form, requiredMemberships },
      }
    }),
  ]
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  options,
  { plugins }
) => {
  const forms =
    (options.find((opt) => opt.key === 'forms')?.value as UndefinedOr<
      GatedMessage[]
    >) ?? []
  const memberships = getMemberships(plugins)

  return [
    {
      paths: ['gated-form'],
      component: Admin,
      props: { forms, memberships },
    },
    {
      paths: ['gated-form', 'new'],
      component: AdminNew,
      props: { forms, memberships, id: uniqueString() },
    },
    ...(forms?.map((form) => ({
      paths: ['gated-form', form.id],
      component: AdminEdit,
      props: {
        forms,
        memberships,
        id: form.id,
      },
      slots: {
        'aside:after-built-in-buttons': RemoveButton,
      },
    })) ?? []),
  ]
}

export const meta: ClubsPluginMeta = {
  displayName: 'Message',
  category: ClubsPluginCategory.Growth,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
