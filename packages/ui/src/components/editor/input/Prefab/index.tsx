import React from 'react'
import FileBrowserInput from '../FileBrowser'
import { StringInputProps } from '../String'

function PrefabInput({ ...rest }: StringInputProps) {
  return <FileBrowserInput acceptFileTypes={['xre.gltf']} acceptDropItems={['gltf', 'xre.gltf']} {...rest} />
}

PrefabInput.defaultProps = {}

export default PrefabInput
