import { Metadata } from '../Metadata'
import { Socket } from '../Sockets/Socket'
import { EventEmitter } from './EventEmitter'

export class CustomEvent {
  public label = ''
  public metadata: Metadata = {}
  public readonly eventEmitter = new EventEmitter<{
    [parameterName: string]: any
  }>()
  public readonly id: string
  public readonly name: string
  public readonly parameters: Socket[]

  constructor(id: string, name: string, parameters: Socket[] = []) {
    this.id = id
    this.name = name
    this.parameters = parameters
  }
}
