import React from 'react'
import { useTranslation } from 'react-i18next'

const styledLoadingStyles = (isFullscreen) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: isFullscreen ? '100vh' : '100%',
  width: isFullscreen ? '100vw' : '100%',
  minHeight: '300px'
})

const StyledLoading = ({ isFullscreen, children }) => {
  const loadingStyles = styledLoadingStyles(isFullscreen) as React.CSSProperties
  return <div style={loadingStyles}>{children}</div>
}

export const Loading = (props) => {
  const { t } = useTranslation()

  // Rendering loading view
  return (
    <StyledLoading isFullscreen={props.fullScreen}>
      {t('editor:lbl-return')}
      {props.message}
    </StyledLoading>
  )
}

export default Loading
