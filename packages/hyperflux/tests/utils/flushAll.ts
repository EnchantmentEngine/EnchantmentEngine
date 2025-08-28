import * as Scheduler from 'scheduler'

const _moreWork = () => {
  return Scheduler.unstable_getFirstCallbackNode() !== null
}

export const flushAll = async () => {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (!_moreWork()) {
        resolve()
      } else {
        setTimeout(check, 1)
      }
    }
    check()
  })
}
