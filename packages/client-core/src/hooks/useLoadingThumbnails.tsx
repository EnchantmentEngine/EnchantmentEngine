import { State, useMutableState } from '@ir-engine/hyperflux'
import { useEffect, useRef } from 'react'
import { FileThumbnailJobState } from '../common/services/FileThumbnailJobState'

const useLoadingThumbnails = (isLoading: State<boolean>) => {
  const thumbnailJobs = useMutableState(FileThumbnailJobState).jobs
  const debouncedStatusRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(debouncedStatusRef.current)
  }, [])

  useEffect(() => {
    if (debouncedStatusRef) {
      clearTimeout(debouncedStatusRef.current)
    }

    const isThumbnailsLoading = thumbnailJobs.length > 0
    if (isThumbnailsLoading) {
      isLoading.set(true)
    } else {
      debouncedStatusRef.current = setTimeout(() => {
        isLoading.set(false)
      }, 1000)
    }

    return () => {
      clearTimeout(debouncedStatusRef.current)
    }
  }, [thumbnailJobs.length])

  return
}

export default useLoadingThumbnails
