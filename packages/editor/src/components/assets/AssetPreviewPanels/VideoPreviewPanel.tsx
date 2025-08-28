import React from 'react'

const videoStyles = {
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: '500px',
  height: 'auto'
}

/**
 * @param props
 * @returns
 */

export const VideoPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl

  return (
    <video style={videoStyles} src={url} controls={true}>
      Your Browser doesn't support Video
    </video>
  )
}
