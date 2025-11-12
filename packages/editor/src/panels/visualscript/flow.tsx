import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Background, BackgroundVariant, NodeToolbar, Panel, Position, ReactFlow } from 'reactflow'

import { useVisualScriptRunner } from '@ir-engine/engine'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button } from '@ir-engine/ui'
import { GraphJSON, IRegistry } from '@ir-engine/visual-script'
import CustomControls from './controls'
import {
  useFlowHandlers,
  useNodeSpecGenerator,
  useTemplateHandler,
  useVariableHandler,
  useVisualScriptFlow
} from './hooks'
import { useSelectionHandler } from './hooks/useSelectionHandler'
import { Examples } from './modals/load'
import { NodePicker } from './node/picker'
import SidePanel from './sidepanel'

type FlowProps = {
  initialVisualScript: GraphJSON
  examples: Examples
  registry: IRegistry
  onChangeVisualScript: (newVisualScript: GraphJSON) => void
}

export const Flow: React.FC<FlowProps> = ({
  initialVisualScript: visualScript,
  examples,
  registry,
  onChangeVisualScript
}) => {
  const specGenerator = useNodeSpecGenerator(registry)
  const flowRef = useRef(null)
  const dragging = useHookstate(false)
  const mouseOver = useHookstate(false)
  const { t } = useTranslation()

  const {
    nodes,
    edges,
    variables,
    setVariables,
    onNodesChange,
    onEdgesChange,
    visualScriptJson,
    setVisualScriptJson,
    deleteNodes,
    nodeTypes
  } = useVisualScriptFlow({
    initialVisualScriptJson: visualScript,
    specGenerator
  })

  const {
    onConnect,
    handleStartConnect,
    handleStopConnect,
    handlePaneClick,
    handlePaneContextMenu,
    nodePickerVisibility,
    handleAddNode,
    lastConnectStart,
    closeNodePicker,
    nodePickFilters
  } = useFlowHandlers({
    nodes,
    onEdgesChange,
    onNodesChange,
    specGenerator
  })

  const { handleAddVariable, handleEditVariable, handleDeleteVariable } = useVariableHandler({
    variables,
    setVariables
  })

  const { togglePlay, playing } = useVisualScriptRunner({
    visualScriptJson: visualScriptJson!,
    registry
  })

  const { selectedNodes, selectedEdges, onSelectionChange, copyNodes, pasteNodes } = useSelectionHandler({
    nodes,
    onNodesChange,
    onEdgesChange
  })

  const { handleAddTemplate, handleEditTemplate, handleDeleteTemplate, handleApplyTemplate } = useTemplateHandler({
    selectedNodes,
    selectedEdges,
    pasteNodes,
    onNodesChange
  })

  useEffect(() => {
    if (dragging.value || !mouseOver.value) return
    onChangeVisualScript(visualScriptJson ?? visualScript)
  }, [visualScriptJson]) // change in node position triggers reactor

  return (
    <ReactFlow
      ref={flowRef}
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodeDragStart={() => dragging.set(true)}
      onNodeDragStop={() => dragging.set(false)}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodesDelete={deleteNodes}
      onConnectStart={handleStartConnect}
      onConnectEnd={handleStopConnect}
      onPaneMouseEnter={() => mouseOver.set(true)}
      onPaneMouseLeave={() => mouseOver.set(false)}
      fitView
      fitViewOptions={{ maxZoom: 1 }}
      onPaneClick={handlePaneClick}
      onPaneContextMenu={handlePaneContextMenu}
      onSelectionChange={onSelectionChange}
      multiSelectionKeyCode={'Shift'}
      deleteKeyCode={'Backspace'}
    >
      <Panel position="top-left" className="w-[33%]">
        <SidePanel
          flowref={flowRef}
          examples={examples}
          variables={variables}
          onNodesChange={onNodesChange}
          handleAddTemplate={handleAddTemplate}
          handleApplyTemplate={handleApplyTemplate}
          handleDeleteTemplate={handleDeleteTemplate}
          handleEditTemplate={handleEditTemplate}
          handleAddVariable={handleAddVariable}
          handleEditVariable={handleEditVariable}
          handleDeleteVariable={handleDeleteVariable}
        />
      </Panel>

      <CustomControls
        playing={playing}
        togglePlay={togglePlay}
        onSaveVisualScript={onChangeVisualScript}
        setVisualScript={setVisualScriptJson}
        examples={examples}
        variables={variables}
        specGenerator={specGenerator}
      />

      <Background
        id="1"
        variant={BackgroundVariant.Dots}
        gap={10}
        size={3}
        color="#282828"
        style={{ backgroundColor: '#111113' }}
      />
      <Background id="2" variant={BackgroundVariant.Dots} gap={100} size={6} color="#282828" />

      {nodePickerVisibility && (
        <NodePicker
          position={nodePickerVisibility}
          filters={nodePickFilters}
          onPickNode={handleAddNode}
          onClose={closeNodePicker}
          specJSON={specGenerator?.getAllNodeSpecs()}
        />
      )}

      <NodeToolbar
        nodeId={selectedNodes.map((node) => node.id)}
        isVisible={selectedNodes.length > 1}
        position={Position.Top}
      >
        <Button
          variant="tertiary"
          onClick={() => {
            handleAddTemplate()
          }}
        >
          {t('editor:visualScript.editorPanel.makeTemplate')}
        </Button>
      </NodeToolbar>
    </ReactFlow>
  )
}
