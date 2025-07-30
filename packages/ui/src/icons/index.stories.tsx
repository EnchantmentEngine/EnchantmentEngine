import Fuse from 'fuse.js'
import React, { useEffect, useRef, useState } from 'react'
import * as Icons from '.'
import CopyText from '../primitives/tailwind/CopyText'

export default {
  title: 'Icons/All',
  parameters: {
    componentSubtitle: 'Icons',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2283-24252&node-type=frame&t=XAGvEGVnphLHTwP3-0'
    },
    chromatic: { disable: true }
  }
}

interface FuseSearchItem {
  iconName: string
  index: number
}

const allIcons = Object.entries(Icons).filter(([iconName]) => {
  const parsedIconName = iconName
    .replaceAll('-', '_')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
    .toLowerCase()
  if (iconName.toLowerCase().includes(parsedIconName)) return true
  return false
})

const IconRenderer = () => {
  const [searchedIconName, setSearchedIconName] = useState('')
  const fuseRef = useRef<Fuse<FuseSearchItem> | null>(null)
  const [iconsList, setIconsList] = useState(allIcons)

  useEffect(() => {
    const iconsListFuse = allIcons.map(([iconName, _], index) => {
      return {
        iconName,
        index
      }
    })
    fuseRef.current = new Fuse(iconsListFuse, {
      keys: ['iconName']
    })
  }, [])

  useEffect(() => {
    if (!fuseRef.current || searchedIconName === '') {
      setIconsList(allIcons)
      return
    }

    const searchResult = fuseRef.current.search(searchedIconName)
    const _iconsList = searchResult.map(({ item }) => allIcons[item.index])
    setIconsList(_iconsList)
  }, [searchedIconName])

  return (
    <>
      <div className="my-2">
        <input
          type="text"
          value={searchedIconName}
          onChange={(event) => setSearchedIconName(event.target.value)}
          className="block w-full rounded-lg border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search Icon ..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {iconsList.map(([iconName, IconComponent]) => {
          const importText = `import { ${iconName} } from '@ir-engine/ui/src/icons'`
          return (
            <div key={iconName} className="flex h-full flex-col items-center justify-between rounded-lg border p-4">
              <div className="flex flex-grow flex-col items-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <IconComponent className="h-8 w-8 text-black" />
                </div>
                <p
                  className="mb-2 cursor-copy text-center text-sm font-medium"
                  onClick={() => navigator.clipboard.writeText(iconName)}
                >
                  {iconName}
                </p>
              </div>
              <div className="flex w-full flex-col items-center">
                <code className="mb-2 w-full truncate rounded bg-gray-100 p-1 text-center text-xs">{importText}</code>
                <CopyText text={importText} className="bg-gray-500" />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export const Default = {
  name: 'Default',
  render: IconRenderer
}
