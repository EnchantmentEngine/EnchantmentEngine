import { HookContext } from '../../declarations'

/**
 * Hook used to check if request is signed by App JWT
 */
export const isSignedByAppJWT = () => {
  return (context: HookContext) => {
    return context.params.signedByAppJWT
  }
}
