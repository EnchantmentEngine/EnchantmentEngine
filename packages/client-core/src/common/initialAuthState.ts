export const initialAuthState = {
  jwt: true,
  apple: false,
  discord: false,
  facebook: false,
  github: false,
  google: false,
  linkedin: false,
  twitter: false,
  smsMagicLink: false,
  emailMagicLink: false,
  didWallet: false
}
export type AuthStrategiesType = typeof initialAuthState

export const initialOAuthConnectedState = {
  apple: false,
  discord: false,
  facebook: false,
  github: false,
  google: false,
  linkedin: false,
  twitter: false
}
