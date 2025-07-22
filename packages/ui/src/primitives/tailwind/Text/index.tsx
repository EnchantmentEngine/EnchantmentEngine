import React from 'react'
import { twMerge } from 'tailwind-merge'

const componentTypes = {
  h1: (props: React.HTMLAttributes<any>) => <h1 {...props} />,
  h2: (props: React.HTMLAttributes<any>) => <h2 {...props} />,
  h3: (props: React.HTMLAttributes<any>) => <h3 {...props} />,
  h4: (props: React.HTMLAttributes<any>) => <h4 {...props} />,
  h5: (props: React.HTMLAttributes<any>) => <h5 {...props} />,
  h6: (props: React.HTMLAttributes<any>) => <h6 {...props} />,
  p: (props: React.HTMLAttributes<any>) => <p {...props} />,
  span: (props: React.HTMLAttributes<any>) => <span {...props} />,
  a: (props: React.HTMLAttributes<any>) => <a {...props} />
}

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'
  fontWeight?: 'light' | 'normal' | 'semibold' | 'medium' | 'bold'
  component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'a'
  className?: string
  theme?: 'primary' | 'secondary'
  href?: string
}

const Text = ({
  fontSize = 'base',
  fontWeight = 'normal',
  className,
  children,
  component = 'span',
  theme = 'primary',
  ...props
}: TextProps): JSX.Element => {
  const Component = componentTypes[component]

  const twClassName = twMerge('inline-block leading-normal', `font-${fontWeight} text-${fontSize}`, className)

  return (
    <Component className={twClassName} {...props}>
      {children}
    </Component>
  )
}

export default Text
