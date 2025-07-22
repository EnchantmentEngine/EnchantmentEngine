export type EasingFunction = {
  (t: number): number
  path: string
}

interface EasingType {
  in: EasingFunction
  out: EasingFunction
  inOut: EasingFunction
}

class EasingBuilder<P extends string> {
  private fn: (t: number) => number
  private path: P
  private isFinal: boolean

  private constructor(fn: (t: number) => number, path: P, isFinal: boolean = false) {
    this.fn = fn
    this.path = path
    this.isFinal = isFinal
  }

  static create<P extends string>(fn: (t: number) => number, path: P): EasingType {
    const builder = new EasingBuilder(fn, path)
    return {
      in: builder.createIn(),
      out: builder.createOut(),
      inOut: builder.createInOut()
    }
  }

  private createIn(): EasingFunction {
    const fn = (t: number) => this.fn(t)
    return Object.assign(fn, { path: `${this.path}.in` })
  }

  private createOut(): EasingFunction {
    const fn = (t: number) => 1 - this.fn(1 - t)
    return Object.assign(fn, { path: `${this.path}.out` })
  }

  private createInOut(): EasingFunction {
    const fn = (t: number) => (t < 0.5 ? this.fn(t * 2) / 2 : 1 - this.fn((1 - t) * 2) / 2)
    return Object.assign(fn, { path: `${this.path}.inOut` })
  }
}

export const Easing = (() => {
  const easingObj = {
    linear: EasingBuilder.create((t) => t, 'linear'),
    quadratic: EasingBuilder.create((t) => t * t, 'quadratic'),
    cubic: EasingBuilder.create((t) => t * t * t, 'cubic'),
    quartic: EasingBuilder.create((t) => t * t * t * t, 'quartic'),
    quintic: EasingBuilder.create((t) => t * t * t * t * t, 'quintic'),
    sine: EasingBuilder.create((t) => 1 - Math.cos((t * Math.PI) / 2), 'sine'),
    exponential: EasingBuilder.create((t) => Math.pow(2, 10 * (t - 1)), 'exponential'),
    circle: EasingBuilder.create((t) => 1 - Math.sqrt(1 - t * t), 'circle'),
    back: EasingBuilder.create((t) => {
      const s = 1.70158
      return t * t * ((s + 1) * t - s)
    }, 'back'),
    elastic: EasingBuilder.create(
      (t) => 1 - Math.pow(Math.cos((t * Math.PI) / 2), 3) * Math.cos(t * Math.PI),
      'elastic'
    ),
    bounce: EasingBuilder.create((t) => {
      if (t < 1 / 2.75) return 7.5625 * t * t
      if (t < 2 / 2.75) {
        const t2 = t - 1.5 / 2.75
        return 7.5625 * t2 * t2 + 0.75
      }
      if (t < 2.5 / 2.75) {
        const t2 = t - 2.25 / 2.75
        return 7.5625 * t2 * t2 + 0.9375
      }
      const t2 = t - 2.625 / 2.75
      return 7.5625 * t2 * t2 + 0.984375
    }, 'bounce')
  }

  return Object.assign(easingObj, {
    fromPath: <P extends string>(path: P): EasingFunction => {
      const [name, mode] = path.split('.')
      const easing = easingObj[name as keyof typeof easingObj]
      if (!easing) {
        throw new Error(`Invalid easing function path: ${path}`)
      }
      return easing[mode as keyof EasingType]
    }
  })
})()

// export all of the easing function paths as a strongly typed string array
export const EasingFunctionPaths = Object.values(Easing).reduce<string[]>((acc, easing) => {
  if (typeof easing === 'object') {
    acc.push(easing.in.path, easing.out.path, easing.inOut.path)
  }
  return acc
}, [])

// Usage examples:
// const linear = Easing.linear
// const easeInQuad = Easing.quadratic.in
// const easeInOutSine = Easing.sine.inOut
// const fromPath = Easing.fromPath("quadratic.inOut")
