import AllowedDomains from './allowed-domains/allowed-domains'
import InstanceAttendance from './instance-attendance/instance-attendance'
import InstanceAuthorizedUser from './instance-authorized-user/instance-authorized-user'
import InstanceProvision from './instance-provision/instance-provision'
import InstanceSignaling from './instance-signaling/instance-signaling'
import Instance from './instance/instance'
import InstanceServerLoad from './instanceserver-load/instanceserver-load.service'
import InstanceServerProvision from './instanceserver-provision/instanceserver-provision.service'

export default [
  AllowedDomains,
  Instance,
  InstanceServerLoad,
  InstanceServerProvision,
  InstanceProvision,
  InstanceAttendance,
  InstanceSignaling,
  InstanceAuthorizedUser
]
