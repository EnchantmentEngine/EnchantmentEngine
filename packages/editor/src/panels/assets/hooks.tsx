import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { API } from '@ir-engine/common'
import { StaticResourceQuery, StaticResourceType, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { State, defineState, getMutableState, getState, useHookstate, usePrevious } from '@ir-engine/hyperflux'
import React, { ReactNode, createContext, useContext, useEffect } from 'react'
import { AssetsPanelCategories, MyAssetCategory } from '../../services/AssetPanelCategoriesState'
import { AssetCategoryNode } from './categories'
import { ASSETS_PAGE_LIMIT, calculateItemsToFetch, convertToHierarchy, iterativelyListTags } from './helpers'

// Define a state to track refresh operations
export const AssetsRefreshState = defineState({
  name: 'AssetsRefreshState',
  initial: () => ({
    refreshCounter: 0,
    forceRefresh: false
  }),
  triggerRefresh: (forceRefresh: boolean = true) => {
    getMutableState(AssetsRefreshState).refreshCounter.set((prev) => prev + 1)
    getMutableState(AssetsRefreshState).forceRefresh.set(forceRefresh)
  }
})

const AssetsQueryContext = createContext({
  search: null! as State<{ local: string; query: string }>,
  resources: [] as StaticResourceType[],
  refetchResources: (forceRefresh?: boolean) => {},
  resourcesLoading: false,
  staticResourcesPagination: null! as State<{ total: number; skip: number }>,

  category: {
    currentCategoryPath: null! as State<AssetCategoryNode | undefined>,
    sidebarWidth: null! as State<number>
  }
})

export const assetCategories = convertToHierarchy(AssetsPanelCategories.initial)

export const AssetsQueryProvider = ({ children }: { children: ReactNode }) => {
  const search = useHookstate({ local: '', query: '' })
  const staticResourcesPagination = useHookstate({ total: 0, skip: 0 })
  const resources = useHookstate<StaticResourceType[]>([])
  const resourcesLoading = useHookstate(false)
  const refreshState = useHookstate(getMutableState(AssetsRefreshState))

  const currentCategoryPath = useHookstate<AssetCategoryNode | undefined>(undefined)

  const categorySidbarWidth = useHookstate(300)
  const previousSearchQuery = usePrevious(search.query)

  const staticResourcesFindApi = (forceRefresh = false) => {
    const abortController = new AbortController()
    const selectedCategory = currentCategoryPath.value

    resourcesLoading.set(true)

    const performFetch = () => {
      const tags = selectedCategory ? [selectedCategory.name, ...iterativelyListTags(selectedCategory.children)] : []

      const skip = forceRefresh
        ? 0
        : Math.min(staticResourcesPagination.skip.value, staticResourcesPagination.total.value)

      const limit = forceRefresh
        ? ASSETS_PAGE_LIMIT + calculateItemsToFetch() + staticResourcesPagination.skip.value
        : ASSETS_PAGE_LIMIT + calculateItemsToFetch()

      let query = {} as StaticResourceQuery
      if (selectedCategory?.name === MyAssetCategory) {
        const selfUser = getState(AuthState).user
        query = {
          key: {
            $like: `%${search.query.value}%`
          },
          type: {
            $or: [{ type: 'asset' }]
          },
          userId: selfUser.id,
          $sort: { name: 1 },
          $limit: limit,
          $skip: skip
        } as StaticResourceQuery
      } else {
        query = {
          key: {
            $like: `%${search.query.value}%`
          },
          type: {
            $or: [{ type: 'asset' }]
          },
          tags: selectedCategory
            ? {
                $or: tags.flatMap((tag) => [
                  { tags: { $like: `%${tag.toLowerCase()}%` } },
                  { tags: { $like: `%${tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}%` } },
                  {
                    tags: {
                      $like: `%${tag
                        .split(' ')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ')}%`
                    }
                  }
                ])
              }
            : undefined,
          $sort: { name: 1 },
          $limit: ASSETS_PAGE_LIMIT + calculateItemsToFetch(),
          $skip: forceRefresh
            ? 0
            : Math.min(staticResourcesPagination.skip.value, staticResourcesPagination.total.value)
        } as StaticResourceQuery
      }

      API.instance
        .service(staticResourcePath)
        .find({ query })
        .then((fetchedResources) => {
          if (abortController.signal.aborted) return

          if (!forceRefresh && staticResourcesPagination.skip.value > 0 && previousSearchQuery === search.query.value) {
            resources.merge(fetchedResources.data)
          } else {
            resources.set(fetchedResources.data)
          }

          staticResourcesPagination.merge({ total: fetchedResources.total })

          resourcesLoading.set(false)
        })
    }

    performFetch()

    return () => {
      abortController.abort()
    }
  }

  useEffect(() => {
    const abortSignal = staticResourcesFindApi()
    return () => abortSignal()
  }, [])
  useEffect(() => {
    if (refreshState.refreshCounter.value > 0) {
      staticResourcesFindApi(refreshState.forceRefresh.value)
    }
  }, [refreshState.refreshCounter.value])

  return (
    <AssetsQueryContext.Provider
      value={{
        search,
        resources: resources.value as StaticResourceType[],
        refetchResources: (forceRefresh = false) => {
          staticResourcesFindApi(forceRefresh)
        },
        resourcesLoading: resourcesLoading.value,
        staticResourcesPagination,
        category: {
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
