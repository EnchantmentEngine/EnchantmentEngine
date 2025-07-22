export const OperatingSystems = {
  Windows: 0,
  MacOS: 1,
  Linux: 2,
  Android: 3,
  iOS: 4,
  Unknown: 5
} as const

export type OperatingSystemsType = (typeof OperatingSystems)[keyof typeof OperatingSystems]

export function detectOS() {
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
  const iosPlatforms = ['iPhone', 'iPad', 'iPod']
  let os = OperatingSystems.Unknown as OperatingSystemsType

  if (macosPlatforms.includes(platform)) {
    os = OperatingSystems.MacOS
  } else if (iosPlatforms.includes(platform)) {
    os = OperatingSystems.iOS
  } else if (windowsPlatforms.includes(platform)) {
    os = OperatingSystems.Windows
  } else if (/Android/.test(userAgent)) {
    os = OperatingSystems.Android
  } else if (/Linux/.test(platform)) {
    os = OperatingSystems.Linux
  }

  return os
}

/**
 * Returns true if the user's operating system uses the control key for keyboard shortcuts. (e.g. Windows, Linux)
 *
 * OR
 *
 * false if the user's operating system uses the command key for keyboard shortcuts. (e.g. MacOS)
 */
export function usesCtrlKey() {
  return detectOS() !== OperatingSystems.MacOS
}
