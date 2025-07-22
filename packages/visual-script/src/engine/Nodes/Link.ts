
import { Socket } from '../Sockets/Socket'
import { INode } from './NodeInstance'

export class Link {
  public _targetNode: INode | undefined = undefined
  public _targetSocket: Socket | undefined = undefined
  public nodeId: string
  public socketName: string

  constructor(nodeId: string = '', socketName: string = '') {
    this.nodeId = nodeId
    this.socketName = socketName
  }
}
