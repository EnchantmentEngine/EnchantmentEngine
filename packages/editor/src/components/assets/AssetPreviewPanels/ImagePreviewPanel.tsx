import React from 'react'

const imageStyles = {
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  maxHeight: '100%',
  height: 'auto',
  maxWidth: '100%'
}

/**
 * @param props
 */

export const ImagePreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl

  return <img src={url} alt="Photo" crossOrigin="anonymous" style={imageStyles} />
}
