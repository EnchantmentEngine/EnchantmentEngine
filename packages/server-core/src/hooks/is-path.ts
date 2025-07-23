import { HookContext } from '../../declarations'

export default (...params: string[]) => {
  const args = Array.from(params)
  return (context: HookContext): boolean => {
    return args.includes(context.path)
  }
}
