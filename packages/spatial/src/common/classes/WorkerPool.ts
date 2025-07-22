/**
 * @author Deepkolos / https://github.com/deepkolos
 */

export class WorkerPool {
  limit: number
  queue = [] as Array<{ resolve: any; msg: any; transfer: Transferable[]; signal?: AbortSignal }>
  workers = [] as Worker[]
  workersResolve = [] as Array<any>
  workerStatus = 0

  private workerCreator?: () => Worker

  constructor(pool = 1) {
    this.limit = pool
  }

  _initWorker(workerId: number) {
    if (!this.workers[workerId]) {
      const worker = this.workerCreator!()
      worker.addEventListener('message', this._onMessage.bind(this, workerId))
      this.workers[workerId] = worker
    }
  }

  _getIdleWorker() {
    for (let i = 0; i < this.limit; i++) if (!(this.workerStatus & (1 << i))) return i

    return -1
  }

  _onMessage(workerId: number, msg: MessageEvent) {
    const resolve = this.workersResolve[workerId]
    resolve && resolve(msg)
    this.workersResolve[workerId] = null

    if (this.queue.length) {
      this._postWorker(workerId)
    } else {
      this.workerStatus ^= 1 << workerId
    }
  }

  _postWorker(workerId: number) {
    const { resolve, msg, transfer, signal } = this.queue.shift() as any
    if (signal?.aborted) {
      if (this.queue.length) this._postWorker(workerId)
      return
    }
    this.workersResolve[workerId] = resolve
    this.workers[workerId].postMessage(msg, transfer)
  }

  setWorkerCreator(workerCreator: () => Worker) {
    this.workerCreator = workerCreator
  }

  setWorkerLimit(pool: number) {
    this.limit = pool
  }

  postMessage<T = any>(msg: any, transfer: Transferable[], signal?: AbortSignal): Promise<MessageEvent<T>> {
    return new Promise((resolve) => {
      const workerId = this._getIdleWorker()

      if (workerId !== -1) {
        this._initWorker(workerId)
        this.workerStatus |= 1 << workerId
        this.workersResolve[workerId] = resolve
        this.workers[workerId].postMessage(msg, transfer)
      } else {
        this.queue.push({ resolve, msg, transfer, signal })
      }
    })
  }

  dispose() {
    this.workers.forEach((worker) => worker.terminate())
    this.workersResolve.length = 0
    this.workers.length = 0
    this.queue.length = 0
    this.workerStatus = 0
  }
}
