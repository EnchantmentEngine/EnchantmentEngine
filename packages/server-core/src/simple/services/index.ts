import { Application } from '@feathersjs/feathers'

import p2pSignaling from './p2p-signaling/p2p-signaling'

const services = [p2pSignaling]

export default function (app: Application) {
  for (const service of services) service(app)
}
