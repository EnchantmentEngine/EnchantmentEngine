import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'

export const handleSoundEffect = () => {
  AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)
}

export const isValidHttpUrl = (urlString) => {
  let url

  try {
    url = new URL(urlString)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export const getCanvasBlob = (
  canvas: HTMLCanvasElement,
  fileType = 'image/png',
  quality = 0.9
): Promise<Blob | null> => {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, fileType, quality))
}
