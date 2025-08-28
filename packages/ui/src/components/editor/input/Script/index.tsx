import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { CustomScriptFileTypes } from '@ir-engine/spatial/src/resources/fileTypes'
import React from 'react'
import FileBrowserInput from '../FileBrowser'
import { StringInputProps } from '../String'

export function ScriptInput({ ...rest }: StringInputProps) {
  return <FileBrowserInput acceptFileTypes={CustomScriptFileTypes} acceptDropItems={ItemTypes.Scripts} {...rest} />
}

export default ScriptInput
