import { Link } from '../Nodes/Link'

export type Choices = string[] | { text: string; value: any }[]

export class Socket {
  public readonly links: Link[] = []
  public readonly valueTypeName: string
  public readonly name: string
  public value: any | undefined
  public readonly label: string | undefined
  public readonly valueChoices?: Choices // if not empty, value must be one of these.

  constructor(
    valueTypeName: string,
    name: string,
    value: any | undefined = undefined,
    label: string | undefined = undefined,
    valueChoices?: Choices
  ) {
    this.valueTypeName = valueTypeName
    this.name = name
    this.value = value
    this.label = label
    this.valueChoices = valueChoices
  }
}
