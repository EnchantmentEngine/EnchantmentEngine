import { describe } from 'vitest'

// import { AuthState, AuthAction, avatarFetchedReceptor } from '../../src/user/services/AuthService' // make browser globals defined

// import { createEngine } from '@ir-engine/ecs/src/Engine'
// import { getMutableState } from '@ir-engine/hyperflux
// import { Downgraded } from '@ir-engine/hyperflux'

// ;(globalThis as any).document = {}
// ;(globalThis as any).navigator = {}
// ;(globalThis as any).window = {}

describe('Auth Service', () => {
  // beforeEach(() => {
  //   createEngine()
  // })
  // describe('Auth Receptors', () => {
  //   it('avatarFetchedReceptor', () => {
  //     // mock
  //     const mockAuthState = getMutableState(AuthState)
  //     const mockData = {
  //       id: 'c7456310-48d5-11ec-8706-c7fb367d91f0',
  //       key: 'avatars/assets/CyberbotGreen.glb',
  //       name: 'CyberbotGreen',
  //       url: 'https://host.name/avatars/assets/CyberbotGreen.glb',
  //       userId: null
  //     } as any
  //     const mockAction = AuthAction.updateAvatarListAction({ avatarList: [mockData] })
  //     // logic
  //     avatarFetchedReceptor(mockAuthState, mockAction)
  //     const dataResult = mockAuthState.attach(Downgraded).value
  //     // test
  //     assert.equal(mockAuthState.avatarList.length, 1)
  //     assert.deepStrictEqual(dataResult.avatarList[0], { avatar: mockData }) // Fails...
  //   })
  // })
})
