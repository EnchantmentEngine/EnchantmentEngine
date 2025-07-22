import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEdges, useNodes } from 'reactflow'

import { VariableJSON } from '@ir-engine/visual-script'

import { Modal } from '.'
import { NodeSpecGenerator } from '../hooks'
import { flowToVisual } from '../transformers'

export type SaveModalProps = {
  open?: boolean
  variables: VariableJSON[]
  onClose: () => void
  specGenerator: NodeSpecGenerator
}

export const SaveModal: React.FC<SaveModalProps> = ({ open = false, variables, onClose, specGenerator }) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const edges = useEdges()
  const nodes = useNodes()

  const flow = useMemo(() => flowToVisual(nodes, edges, variables, specGenerator), [nodes, edges, specGenerator])

  const jsonString = JSON.stringify(flow, null, 2)

  const handleCopy = () => {
    ref.current?.select()
    document.execCommand('copy')
    ref.current?.blur()
    setCopied(true)
    setInterval(() => {
      setCopied(false)
    }, 1000)
  }

  return (
    <Modal
      title={t('editor:visualScript.modal.save')}
      actions={[
        { label: t('editor:visualScript.modal.buttons.cancel'), onClick: onClose },
        {
          label: copied
            ? t('editor:visualScript.modal.buttons.copy.done')
            : t('editor:visualScript.modal.buttons.copy.begin'),
          onClick: handleCopy
        }
      ]}
      open={open}
      onClose={onClose}
    >
      <textarea
        ref={ref}
        className="m-0 h-32 w-full border border-neutral-700 bg-neutral-800 p-2 text-neutral-100"
        defaultValue={jsonString}
      ></textarea>
    </Modal>
  )
}
