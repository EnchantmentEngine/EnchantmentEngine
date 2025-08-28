export function getOS() {
  const platform = process.platform

  if (platform.includes('darwin')) {
    return 'macOS'
  } else if (platform.includes('win32')) {
    return 'Windows'
  } else if (platform.includes('linux')) {
    return 'Linux'
  }
  return 'other'
}

export const isApple = () => {
  if ('navigator' in globalThis === false) return false

  const iOS_1to12 = /iPad|iPhone|iPod/.test(navigator.platform)

  const iOS13_iPad = navigator.platform === 'MacIntel'

  const iOS1to12quirk = () => {
    const audio = new Audio() // temporary Audio object
    audio.volume = 0.5 // has no effect on iOS <= 12
    return audio.volume === 1
  }

  return iOS_1to12 || iOS13_iPad || iOS1to12quirk()
}
