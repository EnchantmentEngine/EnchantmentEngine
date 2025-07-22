import { HookContext } from '../../declarations'

export default (...params: string[]) => {
  const args = Array.from(params)
  return (hook: HookContext): boolean => {
    return (
      (hook.params?.query && args.includes(hook.params.query.action)) ||
      (hook.params?.actualQuery && args.includes(hook.params.actualQuery.action)) ||
      (hook.data?.action && args.includes(hook.data.action))
    )
  }
}
