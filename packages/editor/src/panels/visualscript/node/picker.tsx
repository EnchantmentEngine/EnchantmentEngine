import { Input } from '@ir-engine/ui'
import { NodeSpecJSON } from '@ir-engine/visual-script'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GoDotFill } from 'react-icons/go'
import { HiMagnifyingGlass, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi2'
import { XYPosition, useReactFlow } from 'reactflow'
import { twMerge } from 'tailwind-merge'
import { VisualScriptPanelTab } from '..'
import { useOnPressKey } from '../hooks'
import { categoryColorMap, colors } from '../util/colors'

const createPickerNodes = (tree, onPickNode, position, instance) => {
  if (tree?.type !== undefined && typeof tree?.type === 'string') return null
  return Object.entries(tree)
    .filter(([key, value]) => key !== 'group')
    .map(([key, value]) => {
      return (
        <PickerItem
          key={key}
          label={key}
          node={value}
          onPickNode={onPickNode}
          position={position}
          instance={instance}
          color={categoryColorMap[key] ?? categoryColorMap.None}
        />
      )
    })
}

const PickerItem = ({ label, node, onPickNode, position, instance, color }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [childNodes, setChildNodes] = useState(null)
  const [isLeafNode, setIsLeafNode] = useState(false)
  useEffect(() => {
    if (!isExpanded && !childNodes) {
      const children = createPickerNodes(node, onPickNode, position, instance) as any
      setChildNodes(children)
      if (children === null) {
        setIsLeafNode(true)
      }
    }
  }, [isExpanded])

  const handleNodeClick = () => {
    if (isLeafNode) {
      const paneBounds = document.getElementById(VisualScriptPanelTab.id!)!.getBoundingClientRect()

      const newPosition = { x: position.x + paneBounds.x, y: position.y + paneBounds.y }

      onPickNode(node.type, instance.screenToFlowPosition(newPosition))
    }
    setIsExpanded(!isExpanded)
  }
  const finalColor = (colors[color][0] as string).slice(2)

  return (
    <>
      <div onClick={handleNodeClick} className="flex w-full items-center justify-between py-1 pl-2">
        <span className="flex flex-row items-center gap-3 text-center text-white">
          <GoDotFill className={`text${finalColor}`} />
          {label}
        </span>
        {node && !isLeafNode && (
          <button className="bg-transparent pr-2 text-white">
            {isExpanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
          </button>
        )}
      </div>
      {isExpanded && childNodes && <div className="pl-4">{childNodes}</div>}
    </>
  )
}

const NodePickerNode = ({ nodes, onPickNode, position, instance }) => {
  const nodeTree = {}
  nodes.forEach((node) => {
    const parts = node.type.split('/')
    let current = nodeTree
    parts.forEach((part) => {
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    })
    current['type'] = node.type
  })

  const initialTreeNodes = createPickerNodes(nodeTree, onPickNode, position, instance)

  return <div className="flex h-48 flex-col overflow-x-hidden overflow-y-scroll">{initialTreeNodes}</div>
}

export type NodePickerFilters = {
  handleType: 'source' | 'target'
  valueType: string
}

type NodePickerProps = {
  position: XYPosition
  filters?: NodePickerFilters
  onPickNode: (type: string, position: XYPosition) => void
  onClose: () => void
  specJSON: NodeSpecJSON[] | undefined
}

const pickerStyle = {
  width: '240px',
  height: '280px'
}

export const NodePicker: React.FC<NodePickerProps> = ({
  position,
  onPickNode,
  onClose,
  filters,
  specJSON
}: NodePickerProps) => {
  const [search, setSearch] = useState('')

  const instance = useReactFlow()
  useOnPressKey('Escape', onClose)
  const { t } = useTranslation()

  if (!specJSON) return null
  let filtered = specJSON
  if (filters !== undefined) {
    filtered = filtered?.filter((node) => {
      const sockets = filters?.handleType === 'source' ? node.outputs : node.inputs
      return sockets.some((socket) => socket.valueType === filters?.valueType)
    })
  }

  filtered =
    filtered?.filter((node) => {
      const term = search.toLowerCase()
      return node.type.toLowerCase().includes(term)
    }) || []

  const paneBounds = document.getElementById(VisualScriptPanelTab.id!)!.getBoundingClientRect()
  const width = parseInt(pickerStyle.width)
  const height = parseInt(pickerStyle.height)

  position.x =
    position.x - width > 0 ? (position.x + width > paneBounds.width ? (position.x -= width) : position.x) : position.x
  position.y =
    position.y - height > 0
      ? position.y + height > paneBounds.height
        ? (position.y -= height)
        : position.y
      : position.y

  return (
    <div
      className={twMerge('absolute z-10 rounded border-zinc-800 bg-neutral-900 text-sm')}
      style={{ ...{ top: position.y, left: position.x, ...pickerStyle } }}
    >
      <div className="flex justify-center p-2 text-white">{t('editor:visualScript.picker.title')}</div>
      <Input
        placeholder={'Type to filter'}
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
        }}
        startComponent={<HiMagnifyingGlass className="text-white" />}
      />
      <NodePickerNode nodes={filtered} onPickNode={onPickNode} position={position} instance={instance} />
    </div>
  )
}
