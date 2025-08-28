/**
 * Wraps a worker in a blob URL to allow it to be referenced from a separate domain (such as an edge cache)
 * @param {string} path
 * @param {boolean} isModule
 * @param {WorkerOptions} workerArgs
 * @returns {string}
 */
export const createWorkerFromCrossOriginURL = (path: string, isModule = true, workerArgs: WorkerOptions = {}) => {
  // in vite dev mode, path is relative to origin, in built environment it has the full url
  const workerURL = path.startsWith(window.location.origin) ? path : new URL(window.location.origin + path).href

  const data = isModule ? `import '${workerURL}';` : `importScripts('${workerURL}')`

  const workerBlob = new Blob([data], { type: 'text/javascript' })

  const workerBlobUrl = URL.createObjectURL(workerBlob)

  const worker = new Worker(workerBlobUrl, { type: isModule ? 'module' : 'classic', ...workerArgs })
  worker.onerror = (error) => {
    console.error('Worker error:', error)
  }
  return worker
}
