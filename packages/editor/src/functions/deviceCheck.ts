export const isSupportedDevice = () => {
  const userAgent = window.navigator.userAgent

  const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i]

  const isMobile = toMatch.some((toMatchItem) => {
    return userAgent.match(toMatchItem)
  })

  return !isMobile
}
