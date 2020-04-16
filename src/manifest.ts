import * as semver from 'semver'
import {debug} from '@actions/core'

import os = require('os')
import cp = require('child_process')
import fs = require('fs')

export interface IToolReleaseFile {
  filename: string
  platform: string
  platform_version?: string
  arch: string
  download_url: string
}

export interface IToolRelease {
  version: string
  stable: boolean
  release_url: string
  files: IToolReleaseFile[]
}

export async function _findMatch(
  versionSpec: string,
  stable: boolean,
  candidates: IToolRelease[]
): Promise<IToolRelease | undefined> {
  const archFilter = os.arch()
  const platFilter = os.platform()

  let result: IToolRelease | undefined
  let match: IToolRelease | undefined

  let file: IToolReleaseFile | undefined
  for (const candidate of candidates) {
    const version = candidate.version

    debug(`check ${version} satisfies ${versionSpec}`)
    if (
      semver.satisfies(version, versionSpec) &&
      (!stable || candidate.stable === stable)
    ) {
      file = candidate.files.find(item => {
        debug(
          `${item.arch}===${archFilter} && ${item.platform}===${platFilter}`
        )

        let chk = item.arch === archFilter && item.platform === platFilter
        if (chk && item.platform_version) {
          const osVersion = module.exports._getOsVersion()

          if (osVersion === item.platform_version) {
            chk = true
          } else {
            chk = semver.satisfies(osVersion, item.platform_version)
          }
        }

        return chk
      })

      if (file) {
        debug(`matched ${candidate.version}`)
        match = candidate
        break
      }
    }
  }

  if (match && file) {
    result = Object.assign({}, match)
    result.files = [file]
  }

  return result
}

export function _getOsVersion(): string {
  const plat = os.platform()
  let version = ''

  if (plat === 'darwin') {
    version = cp.execSync('sw_vers -productVersion').toString()
  } else if (plat === 'linux') {
    const lsbContents = module.exports._readLinuxVersionFile()
    if (lsbContents) {
      const lines = lsbContents.split('\n')
      for (const line of lines) {
        const parts = line.split('=')
        if (parts.length === 2 && parts[0].trim() === 'DISTRIB_RELEASE') {
          version = parts[1].trim()
          break
        }
      }
    }
  }

  return version
}

export function _readLinuxVersionFile(): string {
  const lsbFile = '/etc/lsb-release'
  let contents = ''

  if (fs.existsSync(lsbFile)) {
    contents = fs.readFileSync(lsbFile).toString()
  }

  return contents
}