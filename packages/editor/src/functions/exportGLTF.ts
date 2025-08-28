import { Entity } from '@ir-engine/ecs/src/Entity'
import { STATIC_ASSET_REGEX } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { exportGLTFScene } from '@ir-engine/engine/src/gltf/exportGLTFScene'
import { uploadProjectFiles } from './assetFunctions'

export default async function exportGLTF(entity: Entity, path: string, exportRoot = true) {
  const [, orgname, pName, fileName] = STATIC_ASSET_REGEX.exec(path)!
  return exportRelativeGLTF(entity, `${orgname}/${pName}`, fileName, exportRoot)
}

export async function exportRelativeGLTF(entity: Entity, projectName: string, relativePath: string, exportRoot = true) {
  // const isGLTF = /\.gltf$/.test(relativePath)
  // const gltf = await exportGLTFScene(entity, projectName, relativePath, exportRoot)
  // if (!gltf) return
  // const blob = [new Blob([JSON.stringify(gltf, null, 2)])]
  // const file = new File(blob, relativePath)
  const [gltf, ...files] = await exportGLTFScene(entity, projectName, relativePath, exportRoot)
  const blob = [new Blob([JSON.stringify(gltf, null, 2)])]
  const file = new File(blob, relativePath)
  files.push(file)
  const paths = files.map(() => '')
  const [url] = (await Promise.all(
    uploadProjectFiles(projectName, files as File[], paths, [
      {
        contentType: 'model/gltf+json',
        type: 'asset'
      }
    ]).promises
  )) as string[]
  console.log('exported model data to ', url)
  return url
}
