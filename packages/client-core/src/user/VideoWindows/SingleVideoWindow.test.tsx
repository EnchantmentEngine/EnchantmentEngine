import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API } from '@ir-engine/common'
import {
  avatarPath,
  messagePath,
  staticResourcePath,
  userAvatarPath,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { createEngine, destroyEngine, EngineState, Entity } from '@ir-engine/ecs'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import {
  applyIncomingActions,
  EventDispatcher,
  getMutableState,
  getState,
  HyperFlux,
  joinNetwork,
  MediaChannelState,
  NetworkID,
  NetworkState,
  NetworkTopics,
  screenshareVideoMediaChannelType,
  UserID,
  webcamAudioMediaChannelType,
  webcamVideoMediaChannelType
} from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { LocationState } from '../../social/services/LocationService'
import { SingleVideoWindow } from './window'
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

vi.mock('hark', () => {
  return {
    default: vi.fn(() => ({
      on: vi.fn(),
      stop: vi.fn()
    }))
  }
})

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: [] })),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn()
  }))
})

globalThis.MediaStream = class {
  getAudioTracks() {
    return [{ kind: 'audio', enabled: true }]
  }
  getVideoTracks() {
    return [{ kind: 'video', enabled: true }]
  }
} as any

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    enumerateDevices: vi.fn().mockResolvedValue([]),
    getUserMedia: vi.fn().mockResolvedValue(new MediaStream()),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
})

let eventDispatcher: EventDispatcher
let db: Record<string, Record<string, any>>

const hostUserID = 'host user id' as UserID

const sceneID = 'scene id'
const sceneURL = '/empty.gltf'

describe('SingleVideoWindow component', () => {
  let sceneEntity: Entity
  beforeEach(() => {
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
          userId: hostUserID,
          avatarId: uuidv4(),
          avatar: {
            modelResource: {
              url: '/avatar.gltf'
            }
          }
        }
      ],
      [avatarPath]: [],
      [messagePath]: []
    }

    const createService = (path: string) => {
      return {
        find: () => {
          return new Promise((resolve) => {
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
      [messagePath]: createService(messagePath),
      [userPath]: createService(userPath)
    }
    eventDispatcher = new EventDispatcher()
    ;(API.instance as any) = {
      service: (path: string) => {
        const existing = apis[path]
        if (!existing) throw new Error(`Missing mock service for path: ${path}`)
        return existing
      }
    }

    getMutableState(LocationState).currentLocation.location.sceneURL.set(sceneURL)
    SceneState.loadScene(sceneURL, sceneID)

    sceneEntity = getState(SceneState)[sceneURL]

    const peerID = HyperFlux.store.peerID
    const instanceID = 'instanceID' as NetworkID
    getMutableState(EngineState).userID.set(hostUserID)

    createMockNetwork(NetworkTopics.world, peerID, hostUserID)
    const network = joinNetwork(instanceID, peerID, NetworkTopics.world)

    const worldNetworkId = network.id
    getMutableState(NetworkState).networks[network.id].set({
      ...network,
      hostPeerID: peerID,
      ready: true
    })
    getMutableState(NetworkState).hostIds.media.set(worldNetworkId)

    getMutableState(MediaChannelState).set({
      [peerID]: {
        [webcamVideoMediaChannelType]: {
          stream: new MediaStream(),
          quality: 'smallest',
          paused: false,
          element: document.createElement('video')
        },
        [webcamAudioMediaChannelType]: {
          stream: new MediaStream(),
          quality: 'smallest',
          paused: false,
          element: document.createElement('audio')
        },
        [screenshareVideoMediaChannelType]: {
          stream: new MediaStream(),
          quality: 'smallest',
          paused: false,
          element: document.createElement('video')
        }
      }
    })

    applyIncomingActions()

    render(<SingleVideoWindow peerID={peerID} type="cam" />)
  })

  afterEach(() => {
    cleanup()
    destroyEngine()
  })

  it('should render a container element with the data-testid attribute "video-window"', () => {
    const videoWindow = screen.getByTestId('video-window')
    // @ts-expect-error
    expect(videoWindow).toBeInTheDocument()
  })

  it('should render a container element with the data-testid attribute "avatar-thumbnail"', () => {
    const avatarThumbnail = screen.getByTestId('avatar-thumbnail')
    // @ts-expect-error
    expect(avatarThumbnail).toBeInTheDocument()
  })
})
