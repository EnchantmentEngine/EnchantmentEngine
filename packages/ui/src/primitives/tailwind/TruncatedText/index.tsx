import React, { AnchorHTMLAttributes, FC } from 'react'
import CopyText from '../CopyText'
import Tooltip from '../Tooltip'

type TruncateTextOptions = {
  truncatorChar?: string
  visibleChars?: number
  truncatorPosition?: 'start' | 'middle' | 'end'
}

export const truncateText = (text: string, options: TruncateTextOptions = {}) => {
  const { visibleChars = 3, truncatorPosition = 'middle', truncatorChar = '...' } = options

  if (text.length <= visibleChars * 2) return text

  const truncators = {
    start: () => `${truncatorChar}${text.slice(-visibleChars)}`,
    middle: () => `${text.slice(0, visibleChars)}${truncatorChar}${text.slice(-visibleChars)}`,
    end: () => `${text.slice(0, visibleChars)}${truncatorChar}`
  }

  return truncators[truncatorPosition]()
}

type TruncatedTextProps = {
  text: string
  variant?: 'copy' | 'text'
} & TruncateTextOptions

const TruncatedText: FC<TruncatedTextProps> = (props) => {
  const { variant = 'text', text, visibleChars = 3, truncatorPosition = 'middle', truncatorChar = '...' } = props

  const variants = {
    copy: (
      <span className="flex items-center">
        <Tooltip content={text}>
          <>{truncateText(text, { visibleChars, truncatorPosition, truncatorChar })}</>
        </Tooltip>
        <CopyText text={text} className="ml-2" />
      </span>
    ),
    text: (
      <span className="flex items-center">
        {truncateText(text, { visibleChars, truncatorPosition, truncatorChar })}
      </span>
    )
  }
  return variants[variant]
}

type TruncatedLinkProps = {
  text: string
  copyable?: boolean
} & TruncateTextOptions &
  AnchorHTMLAttributes<HTMLAnchorElement>

export const TruncatedLink: FC<TruncatedLinkProps> = (props) => {
  const { visibleChars = 3, truncatorPosition = 'middle', truncatorChar = '...', copyable = true, text, href } = props

  if (copyable) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        <TruncatedText
          text={text}
          visibleChars={visibleChars}
          truncatorPosition={truncatorPosition}
          truncatorChar={truncatorChar}
        />
      </a>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {truncateText(text, { visibleChars, truncatorPosition: truncatorPosition })}
    </a>
  )
}

export default TruncatedText
