import { AssetCategoryNode } from './categories'

export type Category = {
  name: string
  object: object
  collapsed: boolean
  isLeaf: boolean
  depth: number
  path?: string
}

export function iterativelyListTags(categories): string[] {
  const tags: string[] = []

  for (const category of categories) {
    tags.push(category.name)
    if (category.children.length > 0) {
      tags.push(...iterativelyListTags(category.children))
    }
  }

  return tags
}

export const ASSETS_PAGE_LIMIT = 10

export const calculateItemsToFetch = () => {
  const parentElement = document.getElementById('asset-panel')?.getBoundingClientRect()
  const containerHeight = parentElement ? parentElement.width : 0
  const containerWidth = parentElement ? parentElement.height : 0
  const item = document.getElementsByClassName('resource-file')[0]?.getBoundingClientRect()

  const defaultSize = 160
  const itemHeight = Math.floor((item ? item.height : defaultSize) * window.devicePixelRatio)
  const itemWidth = Math.floor((item ? item.width : defaultSize) * window.devicePixelRatio)

  const itemsInRow = Math.ceil(containerWidth / itemWidth)
  const numberOfRows = Math.ceil(containerHeight / itemHeight)
  return itemsInRow * numberOfRows
}

export function findCategoryByPath(nodes: AssetCategoryNode[], targetPath: string): AssetCategoryNode | null {
  for (const node of nodes) {
    if (node.path === targetPath) {
      return node
    }

    const foundInChildren = findCategoryByPath(node.children, targetPath)
    if (foundInChildren) {
      return foundInChildren
    }
  }

  return null
}

export function convertToHierarchy(obj: Record<string, any>, depth = 0, parentPath = ''): AssetCategoryNode[] {
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
