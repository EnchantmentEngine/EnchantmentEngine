export type MockEventListenerFunc = (this: any, ev?: any) => any
export class MockEventListener {
  listeners: Record<string, MockEventListenerFunc[]> = {}

  hasEvent = (type: string): boolean => {
    return !!this.listeners[type] && this.listeners[type].length !== 0
  }

  addEventListener = (type, listener, options?) => {
    if (this.listeners[type] === undefined) {
      this.listeners[type] = [] as MockEventListenerFunc[]
    }
    this.listeners[type].push(listener)
  }

  removeEventListener = (type, listener, options?) => {
    if (this.listeners[type] === undefined) return
    this.listeners[type]?.pop()
  }
}
