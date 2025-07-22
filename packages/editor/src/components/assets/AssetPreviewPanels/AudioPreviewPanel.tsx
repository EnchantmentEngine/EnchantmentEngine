import React from 'react'

const audioStyles = {
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: '300px',
  maxWidth: '500px'
}

/**
 * @param props
 * @returns
 */
export const AudioPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl

  return (
    <audio src={url} controls={true} style={audioStyles}>
      Your browser doesn't support Audio
    </audio>
  )
}
