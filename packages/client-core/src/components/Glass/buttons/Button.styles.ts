export const distanceVariant = {
  none: ``,
  low: `shadow-lg`,
  high: `shadow-xl`
}

export const fadeVariant = {
  darker: `
    border-2
    bg-black/20
    border-black/10
    hover:bg-transparent
    active:bg-white/10
  `,
  dark: `
    border-2
    bg-black/10
    border-white/[0.05]
    hover:bg-black/5
    active:bg-white/10
  `,
  clear: `
    border-0
    hover:bg-white/20
    active:bg-white/30
  `,
  light: `
    border-2
    bg-white/10
    border-white/10
    hover:bg-white/20
    active:bg-white/30
  `,
  lighter: `
    border-2
    bg-white/20
    border-white/10
    hover:bg-white/30
    active:bg-white/40
  `
}

export const blurVariant = {
  none: ``,
  small: `backdrop-blur-md`,
  medium: `backdrop-blur-lg`,
  large: `backdrop-blur-3xl`
}

export const baseButtonStyles = `
  flex
  items-center
  justify-center
  
  text-white
  text-center
  font-bold
  
  rounded-full
  transition-colors
`
