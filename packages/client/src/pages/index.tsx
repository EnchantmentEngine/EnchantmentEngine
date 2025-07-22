import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'

import config from '@ir-engine/common/src/config'
import { useMutableState } from '@ir-engine/hyperflux'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import ProfileMenu from '@ir-engine/client-core/src/user/menus/ProfileMenu'
import { ViewerMenuState } from '@ir-engine/client-core/src/util/ViewerMenuState'
import useEngineSetting from '@ir-engine/common/src/hooks/useEngineSetting'
import { ClientEngineSettingType } from '@ir-engine/server-core/src/appconfig'
import './index.scss'

const ROOT_REDIRECT = config.client.rootRedirect

export const HomePage = (): any => {
  const { t } = useTranslation()
  const clientSetting = useEngineSetting<ClientEngineSettingType>('client')

  const viewerMenuState = useMutableState(ViewerMenuState)

  useEffect(() => {
    const error = new URL(window.location.href).searchParams.get('error')
    if (error) NotificationService.dispatchNotify(error, { variant: 'error' })
    ModalState.openModal(<ProfileMenu />)
    viewerMenuState.userMenus.profile.set(true)

    return () => {
      viewerMenuState.userMenus.profile.set(false)
    }
  }, [])

  if (ROOT_REDIRECT && ROOT_REDIRECT.length > 0 && ROOT_REDIRECT !== 'false') {
    const redirectParsed = new URL(ROOT_REDIRECT)
    if (redirectParsed.protocol == null) return <Navigate to={ROOT_REDIRECT} />
    else window.location.href = ROOT_REDIRECT
  } else
    return (
      <div className="lander">
        <style>
          {`
            [class*=lander] {
                pointer-events: auto;
            }
          `}
        </style>
        <div className="main-background">
          <div className="img-container">
            {clientSetting?.data?.appBackground && (
              <img
                style={{
                  height: 'auto',
                  maxWidth: '100%'
                }}
                src={clientSetting?.data?.appBackground}
                alt=""
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>
        <nav className="navbar">
          <div className="logo-section">
            {clientSetting?.data?.appTitle && <object className="lander-logo" data={clientSetting?.data?.appTitle} />}
            <div className="logo-bottom">
              {clientSetting?.data?.appSubtitle && (
                <span className="white-txt">{clientSetting?.data?.appSubtitle}</span>
              )}
            </div>
          </div>
        </nav>
        <div className="main-section">
          <div className="desc">
            {clientSetting?.data?.appDescription && (
              <Trans t={t} i18nKey={clientSetting?.data?.appDescription}>
                <span>{clientSetting?.data?.appDescription}</span>
              </Trans>
            )}
            {Boolean(clientSetting?.data?.homepageLinkButtonEnabled) &&
              clientSetting?.data?.homepageLinkButtonRedirect && (
                <button
                  className="gradientButton"
                  autoFocus
                  onClick={() => (window.location.href = clientSetting?.data?.homepageLinkButtonRedirect || '')}
                >
                  {clientSetting?.data?.homepageLinkButtonText}
                </button>
              )}
          </div>
          <div style={{ flexGrow: 1 }}>
            <style>
              {`
                [class*=menu] {
                    position: unset;
                    bottom: 0px;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    transform: none;
                    pointer-events: auto;
                }
              `}
            </style>
          </div>
        </div>
        <div className="link-container">
          <div className="link-block">
            {clientSetting?.data &&
              clientSetting?.data?.appSocialLinks?.length > 0 &&
              clientSetting?.data?.appSocialLinks.map((social, index) => (
                <a key={index} target="_blank" className="icon" href={social.link}>
                  <img
                    style={{
                      height: 'auto',
                      maxWidth: '100%'
                    }}
                    src={social.icon}
                    alt=""
                  />
                </a>
              ))}
          </div>
          <div className="logo-bottom">
            {clientSetting?.data?.appSubtitle && <span className="white-txt">{clientSetting?.data?.appSubtitle}</span>}
          </div>
        </div>
      </div>
    )
}

export default HomePage
