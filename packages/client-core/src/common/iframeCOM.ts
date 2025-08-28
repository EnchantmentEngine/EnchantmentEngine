export interface Message {
  id: string
  method: string
  payload?: any
}

export interface MessageResponse {
  id: string
  success: boolean
  data?: any
}

import { v4 as uuidv4 } from 'uuid'

export class ParentCommunicator {
  private iframe: HTMLIFrameElement
  public iframeId: string
  private targetOrigin: string
  private messageQueue: Map<
    string,
    [(value: MessageResponse | PromiseLike<MessageResponse>) => void, (reason?: any) => void]
  > = new Map()
  private destroyed = false

  constructor(iframeId: string, targetOrigin: string) {
    this.iframeId = iframeId
    this.targetOrigin = targetOrigin
    this.iframe = document.getElementById(iframeId) as HTMLIFrameElement
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  private handleMessage(event: MessageEvent) {
    if (event.origin !== this.targetOrigin || event.source !== this.iframe.contentWindow) return
    const response = event.data as MessageResponse
    if (response && response.id) {
      const [resolver, rejecter] = this.messageQueue.get(response.id) || []
      if (response.success) {
        if (resolver) {
          resolver(response)
          this.messageQueue.delete(response.id)
        }
      } else {
        if (rejecter) {
          rejecter(response)
          this.messageQueue.delete(response.id)
        }
      }
    }
  }

  public sendMessage(method: string, payload?: any): Promise<MessageResponse> {
    if (this.destroyed) throw 'ParentCommunicator has been destroyed already.'
    return new Promise((resolve, reject) => {
      const id = uuidv4()
      const message: Message = { id, method, payload }
      this.messageQueue.set(id, [resolve, reject])
      this.iframe?.contentWindow?.postMessage(message, this.targetOrigin)
    })
  }

  public destroy(): void {
    this.destroyed = true
    window.removeEventListener('message', this.handleMessage.bind(this))
  }
}

// Usage example
//const communicator = new ParentCommunicator('childIframe')
//communicator.sendMessage('getData', { key: 'value' }).then((response) => {
//  console.log('Response received:', response)
//})
