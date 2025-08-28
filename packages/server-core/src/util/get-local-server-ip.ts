import internalIp from 'internal-ip'

import configFile from '../appconfig'

export default async () => {
  return configFile['instance-server'].domain === 'localhost'
    ? ((await internalIp.v4()) as string)
    : configFile['instance-server'].domain
}
