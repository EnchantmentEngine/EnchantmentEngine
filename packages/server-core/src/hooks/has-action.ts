import { HookContext } from '../../declarations'

export default (hook: HookContext): boolean => {
  return !!hook.params?.query?.action || !!hook.params?.actualQuery?.action || !!hook.data?.action
}
