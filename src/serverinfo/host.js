import {
  hostname as getHostname,
  type as getOs,
  platform as getPlatform,
  release as getRelease,
  arch as getArch,
  totalmem as getMemory,
  cpus as getCpus,
  networkInterfaces as getNetworkInterfaces,
} from 'os'

import uuidv5 from 'uuid/v5.js'

// Retrieve host-specific information
export const getHostInfo = function() {
  const id = getHostId()
  const name = getHostname()
  const os = getOs()
  const platform = getPlatform()
  const release = getRelease()
  const arch = getArch()
  const memory = getMemory()
  const cpus = getCpus().length

  return { id, name, os, platform, release, arch, memory, cpus }
}

// Unique id for a given host machine.
// We use UUIDv5 with the MAC address.
const getHostId = function() {
  const macAddress = getMacAddress()
  const hostId = uuidv5(macAddress, uuidv5.DNS)
  return hostId
}

const getMacAddress = function() {
  const ifaces = getNetworkInterfaces()
  const { mac: macA } =
    Object.values(ifaces)
      .flat()
      .find(({ internal, mac }) => !internal && mac) || {}

  if (macA === undefined) {
    return DEFAULT_MAC_ADDRESS
  }

  return macA
}

const DEFAULT_MAC_ADDRESS = '00:00:00:00:00:00'
