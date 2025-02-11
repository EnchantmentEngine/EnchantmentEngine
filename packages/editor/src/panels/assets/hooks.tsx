/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { API, useFind } from '@ir-engine/common'
import { StaticResourceType, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { State, getState, useHookstate, usePrevious } from '@ir-engine/hyperflux'
import React, { ReactNode, createContext, useContext, useEffect } from 'react'
import { ResourceType } from '.'
import { AssetsPanelCategories, MyAssetCategory } from '../../services/AssetPanelCategoriesState'
import { AssetCategoryNode } from './categories'
import { ASSETS_PAGE_LIMIT, calculateItemsToFetch, iterativelyListTags } from './helpers'

const AssetsQueryContext = createContext({
  search: null! as State<{ local: string; query: string }>,
  resources: [] as StaticResourceType[],
  refetchResources: () => {},
  resourcesLoading: false,
  staticResourcesPagination: null! as State<{ total: number; skip: number }>,

  category: {
    activeTab: null! as State<ResourceType>,
    assets: [] as StaticResourceType[],
    currentCategoryPath: null! as State<AssetCategoryNode | undefined>,
    categories: null! as State<AssetCategoryNode[]>,
    sidebarWidth: null! as State<number>
  }
})

export const AssetsQueryProvider = ({ children }: { children: ReactNode }) => {
  const search = useHookstate({ local: '', query: '' })
  const staticResourcesPagination = useHookstate({ total: 0, skip: 0 })
  const resources = useHookstate<StaticResourceType[]>([])
  const resourcesLoading = useHookstate(false)
  const currentCategoryPath = useHookstate<AssetCategoryNode | undefined>(undefined)

  const categories = useHookstate<AssetCategoryNode[]>([])
  const categorySidbarWidth = useHookstate(300)
  const previousSearchQuery = usePrevious(search.query)

  const activeTab = useHookstate<ResourceType>(ResourceType.FAVORITES)

  const staticResourcesFindApi = () => {
    const abortController = new AbortController()
    const selectedCategory = currentCategoryPath.value

    resourcesLoading.set(true)

    const performFetch = () => {
      const tags = selectedCategory ? [selectedCategory.name, ...iterativelyListTags(selectedCategory.children)] : []

      const baseQuery = {
        key: { $like: `%${search.query.value}%` },
        type: { $or: [{ type: 'asset' }] },
        $sort: { name: 1 },
        $limit: ASSETS_PAGE_LIMIT + calculateItemsToFetch(),
        $skip: Math.min(staticResourcesPagination.skip.value, staticResourcesPagination.total.value)
      }

      const query =
        selectedCategory?.name === MyAssetCategory
          ? { ...baseQuery, userId: getState(AuthState).user.id }
          : { ...baseQuery, tags: selectedCategory ? formatTags(tags) : undefined }

      API.instance
        .service(staticResourcePath)
        .find({ query })
        .then((fetchedResources) => {
          if (abortController.signal.aborted) return

          if (staticResourcesPagination.skip.value > 0 && previousSearchQuery === search.query.value) {
            resources.merge(fetchedResources.data)
          } else {
            resources.set(fetchedResources.data)
          }

          staticResourcesPagination.merge({ total: resources.length })
          resourcesLoading.set(false)
        })
    }

    const formatTags = (tags) => ({
      $or: tags.flatMap((tag) => {
        const formattedTag = capitalize(tag)
        return [
          { tags: { $like: `%${tag.toLowerCase()}%` } },
          { tags: { $like: `%${formattedTag}%` } },
          { tags: { $like: `%${capitalizeWords(tag)}%` } }
        ]
      })
    })

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    const capitalizeWords = (str) => str.split(' ').map(capitalize).join(' ')

    performFetch()

    return () => {
      abortController.abort()
    }
  }

  useEffect(() => {
    const abortSignal = staticResourcesFindApi()
    return () => abortSignal()
  }, [])

  function convertToHierarchy(obj: Record<string, any>, depth = 0, parentPath = ''): AssetCategoryNode[] {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = parentPath ? `${parentPath}/${key}` : key

      return {
        name: key,
        path: currentPath,
        depth,
        children: convertToHierarchy(value, depth + 1, currentPath)
      }
    })
  }

  useEffect(() => {
    categories.set(convertToHierarchy(AssetsPanelCategories.initial))
  }, [])

  const { data: assets } = useFind(staticResourcePath, {
    query: {
      ...(activeTab.value === ResourceType.FAVORITES && {
        query: {
          tags: { $like: '%myFavorite%' }
        }
      }),
      ...(activeTab.value === ResourceType.MY_ASSETS && {
        query: {
          tags: { $like: '%myAsset%' }
        }
      })
    }
  })
  console.log(activeTab.value, assets)

  return (
    <AssetsQueryContext.Provider
      value={{
        search,
        resources: resources.value as StaticResourceType[],
        refetchResources: staticResourcesFindApi,
        resourcesLoading: resourcesLoading.value,
        staticResourcesPagination,
        category: {
          activeTab,
          assets: assets as StaticResourceType[],
          categories,
          currentCategoryPath,
          sidebarWidth: categorySidbarWidth
        }
      }}
    >
      {children}
    </AssetsQueryContext.Provider>
  )
}

export const useAssetsQuery = () => useContext(AssetsQueryContext)
export const useAssetsCategory = () => useContext(AssetsQueryContext).category
