import { transform } from '@svgr/core'
import fs from 'fs/promises'
import iconaJson from '../icona.json'

function transformName(name: string) {
  const parts = name.split(/[^A-Za-z0-9]/gi)
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

async function run() {
  const dirExists = await fs
    .opendir('./src/icons/files')
    .then((dir) => dir.close())
    .then(() => true)
    .catch(() => false)

  if (!dirExists) {
    await fs.mkdir('./src/icons/files')
    console.log('created icons/files')
  }

  const newFilePromises = Object.values(iconaJson).map(async (iconEntry) => {
    const componentName = transformName(iconEntry.name)
    const componentFilePath = './src/icons/files/' + componentName + '.tsx'
    const fileExists = await fs
      .access(componentFilePath)
      .then(() => true)
      .catch(() => false)
    if (fileExists) {
      return null
    }
    return { iconEntry, componentName, componentFilePath }
  })

  const transformPromises = (await Promise.all(newFilePromises)).filter(Boolean).map(async (newFile) => {
    if (!newFile) return

    const { iconEntry, componentName, componentFilePath } = newFile
    const correctedSVG = iconEntry.svg.replace(/stroke=\"#\w{6}\"/gi, "stroke='currentColor'")
    const reactComponent = await transform(
      correctedSVG,
      {
        icon: true,
        dimensions: true,
        typescript: true,
        ref: true,
        svgProps: {
          role: 'img',
          stroke: 'currentColor'
        },
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx']
      },
      { componentName }
    )

    console.log(`writing new icon component: ${componentName}`)
    await fs.writeFile(componentFilePath, reactComponent)

    return componentName
  })

  const componentNames = await Promise.all(transformPromises)

  const componentNamesExports = componentNames
    .toSorted()
    .map((componentName) => `export { default as ${componentName} } from './files/${componentName}'`)
    .join('\n')

  const indexFilePath = './src/icons/index.ts'
  const indexFileExists = await fs
    .access(indexFilePath)
    .then(() => true)
    .catch(() => false)

  if (indexFileExists) {
    await fs.appendFile(indexFilePath, componentNamesExports)
  } else {
    await fs.writeFile(indexFilePath, componentNamesExports)
  }

  console.log(`completed writing ${transformPromises.length} files and generated index.ts`)
}

run()
