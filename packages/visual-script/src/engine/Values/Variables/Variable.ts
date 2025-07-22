
import { EventEmitter } from '../../Events/EventEmitter'
import { Metadata } from '../../Metadata'

export class Variable {
  private value: any
  public label = ''
  public metadata: Metadata = {}
  public version = 0 // this is updated on each change to the variable state.
  public readonly onChanged = new EventEmitter<Variable>()
  public readonly id: string
  public readonly name: string
  public readonly valueTypeName: string
  public initialValue: any // this is assumed to be properly deseriealized from a string.

  constructor(id: string, name: string, valueTypeName: string, initialValue: any) {
    this.id = id
    this.name = name
    this.valueTypeName = valueTypeName
    this.initialValue = initialValue
    this.value = this.initialValue
  }

  get(): any {
    return this.value
  }

  set(newValue: any) {
    if (newValue !== this.value) {
      this.value = newValue
      this.version++
      this.onChanged.emit(this)
    }
  }
}
