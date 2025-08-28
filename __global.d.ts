
/// <reference types="vite-plugin-svgr/client" />


/* eslint-disable no-unused-vars */
declare module '*.jpg'
declare module '*.png'
declare module '*.svg'
declare module '*.scss'
declare module '*.scss?inline'
declare module '*.svg?react'
declare module '*.css'
declare module '*.css?inline'
declare module '*.svg?react'
declare module '*.webp'
declare module '*.json'
declare module '*.wav'
declare module '*.glb'
declare module '*.frag'
declare module '*.vert'

declare interface Element {
  setAttribute(qualifiedName: string, value: object): void
}

declare type CbFunction = (this: { el: HTMLElement; [key: string]: any }) => void

declare module '*.glb!text' {
  const value: string
  export default value
}

declare module '*.frag!text' {
  const value: string
  export default value
}

declare module '*.vert!text' {
  const value: string
  export default value
}

declare module '*!text' {
  const _: string
  export default _
}


declare module '*.glb?url' {
  const content: string
  export default content
}

declare module '*.gltf?raw' {
  const content: string
  export default content
} 

// Worker modules (e.g., `?worker` suffix used by Vite)
declare module '*?worker' {
  const WorkerFactory: { new (): Worker }
  export default WorkerFactory
}

declare module '*.wasm' {
  const content: WebAssembly.Module
  export default content
}

declare module '*.txt' {
  const content: string
  export default content
}