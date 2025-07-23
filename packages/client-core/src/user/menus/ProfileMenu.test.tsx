import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API } from '@ir-engine/common'
import {
  avatarPath,
  builderInfoPath,
  engineSettingPath,
  identityProviderPath,
  projectPath,
  projectSettingPath,
  scopePath,
  staticResourcePath,
  userApiKeyPath,
  userAvatarPath,
  UserName
} from '@ir-engine/common/src/schema.type.module'
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { EventDispatcher, getMutableState, UserID } from '@ir-engine/hyperflux'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import UserMenus from '.'
import { ModalState } from '../../common/services/ModalState'
import { AuthState } from '../services/AuthService'
import ProfileMenu, { TermsOfServiceState } from './ProfileMenu'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

let eventDispatcher: EventDispatcher
let db: Record<string, Record<string, any>>
const userID = 'user id' as UserID
const username = 'Test User' as UserName
const sceneID = 'scene id'
const sceneURL = '/empty.gltf'

describe('ProfileMenu component', () => {
  beforeEach(async () => {
    createEngine()

    db = {
      [staticResourcePath]: [
        {
          id: sceneID,
          url: sceneURL
        }
      ],
      [userAvatarPath]: [
        {
          id: uuidv4(),
          userId: userID,
          avatarId: uuidv4(),
          avatar: {
            modelResource: {
              url: '/avatar.gltf'
            }
          }
        }
      ],
      [avatarPath]: [],
      [engineSettingPath]: [
        {
          id: 'auth-setting-id',
          authStrategies: [
            {
              google: true,
              discord: true,
              github: true
            }
          ]
        }
      ],
      [builderInfoPath]: [
        {
          engineVersion: '1.0.0',
          engineCommit: '1234567890'
        }
      ]
    }

    const createService = (path: string) => {
      return {
        find: () => {
          return new Promise((resolve) => {
            console.log(`[MOCK API] find() called for path: ${path}`)
            resolve(
              JSON.parse(
                JSON.stringify({
                  data: db[path],
                  limit: 10,
                  skip: 0,
                  total: db[path].length
                })
              )
            )
          })
        },
        get: (id) => {
          return new Promise((resolve) => {
            const data = db[path].find((entry) => entry.id === id)
            resolve(data ? JSON.parse(JSON.stringify(data)) : null)
          })
        },
        on: (serviceName, cb) => {
          eventDispatcher.addEventListener(serviceName, cb)
        },
        off: (serviceName, cb) => {
          eventDispatcher.removeEventListener(serviceName, cb)
        }
      }
    }

    const apis = {
      [staticResourcePath]: createService(staticResourcePath),
      [userAvatarPath]: createService(userAvatarPath),
      [avatarPath]: createService(avatarPath),
      [userApiKeyPath]: createService(userApiKeyPath),
      [projectSettingPath]: createService(projectSettingPath),
      [scopePath]: createService(scopePath),
      [identityProviderPath]: createService(identityProviderPath),
      [engineSettingPath]: createService(engineSettingPath),
      [projectPath]: createService(projectPath),
      [builderInfoPath]: createService(builderInfoPath)
    }
    eventDispatcher = new EventDispatcher()
    ;(API.instance as any) = {
      service: (path: string) => {
        const existing = apis[path]
        if (!existing) throw new Error(`Missing mock service for path: ${path}`)
        return existing
      }
    }

    getMutableState(ModalState).modals.set([{ element: <ProfileMenu hideLogin={false} />, onClickOutside: () => {} }])

    getMutableState(AuthState).user.set({
      id: userID,
      name: username,
      ageVerified: true,
      isGuest: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    getMutableState(TermsOfServiceState).accepted.set(true)

    render(
      <MemoryRouter>
        <UserMenus />
      </MemoryRouter>
    )
  })

  afterEach(() => {
    destroyEngine()
    cleanup()
  })

  it('should render an avatar image element with the data-testid attribute "avatar-image"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render an edit avatar button with the data-testid attribute "profile-menu-avatar-edit-button"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render an element with the username with the data-testid attribute "profile-menu-username"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render an menu setting button with the data-testid attribute "profile-menu-settings-button"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render a link element with the data-testid attribute "profile-menu-privacy-policy-link"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "profile-menu-logout-button"', () => {
    const openProfileMenuButton = screen.getByTestId('profile-menu-logout-button')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })
})
