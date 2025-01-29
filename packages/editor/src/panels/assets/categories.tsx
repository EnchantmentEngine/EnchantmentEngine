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

import capitalizeFirstLetter from '@ir-engine/common/src/utils/capitalizeFirstLetter'
import { useHookstate } from '@ir-engine/hyperflux'
import EditorDropdownItem from '@ir-engine/ui/src/components/editor/DropdownItem'
import { CubeOutlineLg, File04Lg, Folder, Pin02Lg } from '@ir-engine/ui/src/icons'
import React, { ReactNode } from 'react'
import { RxHamburgerMenu } from 'react-icons/rx'
import { twMerge } from 'tailwind-merge'
import { useCurrentFiles } from '../files/helpers'
import { getParentCategories } from './helpers'
import { useAssetsCategory, useAssetsQuery } from './hooks'

function AssetCategory({ index }: { index: number }) {
  const { categories, currentCategoryPath, expandedCategories } = useAssetsCategory()
  const { refetchResources, staticResourcesPagination } = useAssetsQuery()
  const category = categories[index].value
  const selectedCategory = currentCategoryPath.at(-1)?.value

  const handleClickCategory = () => {
    // setting expanded here
    if (!category.isLeaf) expandedCategories[category.name].set(!category.collapsed)
    currentCategoryPath.set([...getParentCategories(categories.value, category.name), category])
    staticResourcesPagination.skip.set(0)
    refetchResources()
  }

  return (
    <EditorDropdownItem
      label={category.name}
      ItemIcon={Folder}
      selected={selectedCategory?.name === category.name}
      collapsed={category.collapsed}
      onClick={handleClickCategory}
      style={{
        paddingLeft: `${32 * category.depth}px`
      }}
    />
  )
}

function FileCategory({ index }) {
  const { categories, expandedCategories } = useCurrentFiles()
  const category = categories[index].get({ noproxy: true })

  if (category?.name) {
    return (
      <EditorDropdownItem
        label={category?.name}
        ItemIcon={Folder}
        collapsed={category?.collapsed}
        onClick={() => {
          if (!category?.isLeaf) expandedCategories[category.name].set(!category.collapsed)
        }}
        style={{ paddingLeft: `${32 * (category?.depth || 0)}px` }}
      />
    )
  }

  return <></>
}

const SideBarIcons = {
  favorites: Pin02Lg,
  assets: CubeOutlineLg,
  files: File04Lg
}

function SidebarSection({ Icon, label, items = [] }) {
  const [isHover, setIsHover] = React.useState(false)
  const [isActive, setIsActive] = React.useState(false)
  const toggleDropdown = () => {
    setIsActive(!isActive)
  }

  const renderListByType = {
    assets: (
      <>
        {items.map((category, index) => (
          <AssetCategory index={index} />
        ))}
      </>
    ),
    files: (
      <>
        {items.map((category, index) => (
          <FileCategory index={index} />
        ))}
      </>
    )
  }

  return (
    <div
      className={twMerge(
        'transition-all duration-300 ease-in-out',
        isActive && items.length > 0 ? 'h-auto flex-grow' : ''
      )}
    >
      <div
        className={twMerge(
          'overflow-hidden rounded bg-[#141619] p-2 text-[#B2B5BD] hover:bg-[#191B1F] hover:text-[#F5F5F5]',
          'border border-2',
          isActive ? 'border-[#375DAF]' : 'border-transparent'
        )}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <button className="flex h-full w-full items-center justify-between" onClick={toggleDropdown}>
          <div className="flex items-center gap-2">
            <Icon />
            <span>{capitalizeFirstLetter(label)}</span>
          </div>
          {isHover && <RxHamburgerMenu />}
        </button>
      </div>

      {isActive && items.length > 0 && (
        <div className="h-full overflow-y-auto rounded bg-[#141619] p-2 text-[#B2B5BD]">
          {renderListByType[label] || <></>}
        </div>
      )}
    </div>
  )
}

export default function CategoriesList() {
  const { sidebarWidth, categories } = useAssetsCategory()
  const { files, categories: folderCategories } = useCurrentFiles()

  // todo: rename sidebar section to sidebar or find a better name
  const [sidebarSections, setSidebarSections] = React.useState({
    favorites: [],
    assets: [],
    files: [] // todo: rename to folders
  })

  React.useEffect(() => {
    if (categories.value) {
      setSidebarSections({
        ...sidebarSections,
        assets: categories.value as any
      })
    }

    if (files.length) {
      // map folder to  a tree
      setSidebarSections({
        ...sidebarSections,
        files: folderCategories.value as any
      })
    }

    // console.log('sidebar', sidebarSections)
  }, [categories.value, folderCategories.value])

  return (
    <div
      className="flex h-full flex-col space-y-1 overflow-hidden bg-[#0E0F11] pb-2 pl-1 pr-2 pt-2"
      style={{ width: sidebarWidth.value }}
    >
      {Object.entries(sidebarSections).map(([key, value]) => {
        return <SidebarSection key={key} label={key} items={value} Icon={SideBarIcons[key]} />
      })}
    </div>
  )
}

export function VerticalDivider({
  leftChildren,
  rightChildren
}: {
  leftChildren: ReactNode
  rightChildren: ReactNode
}) {
  const { sidebarWidth } = useAssetsCategory()
  const isDragging = useHookstate(false)

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    isDragging.set(true)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging.value) {
      const newWidth = Math.max(200, event.pageX)
      sidebarWidth.set(newWidth)
    }
  }

  const handleMouseUp = () => {
    isDragging.set(false)
  }

  return (
    <div className="flex h-full w-full overflow-hidden" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      <div style={{ width: `${sidebarWidth.value}px` }} className="h-full">
        {leftChildren}
      </div>

      <div className="flex w-5 cursor-pointer items-center" data-testid="assets-panel-vertical-divider">
        <div
          onMouseDown={handleMouseDown}
          className={twMerge('h-full w-full cursor-grab text-white', isDragging.value && 'cursor-grabbing')}
        />
      </div>

      <div className="h-full flex-1">{rightChildren}</div>
    </div>
  )
}
