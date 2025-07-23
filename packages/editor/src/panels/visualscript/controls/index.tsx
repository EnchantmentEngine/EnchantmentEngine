import React, { useState } from 'react'
import { PiDownloadSimpleBold, PiPauseBold, PiPlayBold, PiTrashSimpleBold, PiUploadSimpleBold } from 'react-icons/pi'
import { ControlButton, Controls } from 'reactflow'

import { GraphJSON, VariableJSON } from '@ir-engine/visual-script'
import { NodeSpecGenerator } from '../hooks'
import { ClearModal } from '../modals/clear'
import { HelpModal } from '../modals/help'
import { Examples, LoadModal } from '../modals/load'
import { SaveModal } from '../modals/save'

export type CustomControlsProps = {
  playing: boolean
  togglePlay: () => void
  onSaveVisualScript: (value: GraphJSON) => void
  setVisualScript: (value: GraphJSON) => void
  variables: VariableJSON[]
  examples: Examples
  specGenerator: NodeSpecGenerator | undefined
}

export const CustomControls: React.FC<CustomControlsProps> = ({
  playing,
  togglePlay,
  setVisualScript,
  examples,
  variables,
  specGenerator
}: CustomControlsProps) => {
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [clearModalOpen, setClearModalOpen] = useState(false)
  // load modal should have a drop area for json files
  // save modal should provide a path or file browser to save, or just save automatically
  return (
    <>
      <Controls>
        {/*<ControlButton title="Help" onClick={() => setHelpModalOpen(true)}>
          <FaQuestion />
        </ControlButton>*/}
        <ControlButton title="Load" onClick={() => setLoadModalOpen(true)}>
          <PiUploadSimpleBold />
        </ControlButton>
        <ControlButton
          title="Save"
          onClick={() => {
            setSaveModalOpen(true)
          }}
        >
          <PiDownloadSimpleBold />
        </ControlButton>
        <ControlButton title="Clear" onClick={() => setClearModalOpen(true)}>
          <PiTrashSimpleBold />
        </ControlButton>
        <ControlButton title="Run" onClick={togglePlay}>
          {playing ? <PiPauseBold /> : <PiPlayBold />}
        </ControlButton>
      </Controls>
      <LoadModal
        open={loadModalOpen}
        onClose={() => setLoadModalOpen(false)}
        setVisualScript={setVisualScript}
        examples={examples}
      />
      {specGenerator && (
        <SaveModal
          open={saveModalOpen}
          variables={variables}
          specGenerator={specGenerator}
          onClose={() => setSaveModalOpen(false)}
        />
      )}
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <ClearModal open={clearModalOpen} onClose={() => setClearModalOpen(false)} />
    </>
  )
}

export default CustomControls
