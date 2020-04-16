import * as mm from './manifest'
import * as httpm from '@actions/http-client'


export type IToolRelease = mm.IToolRelease
export type IToolReleaseFile = mm.IToolReleaseFile

export async function getManifestFromUrl(url: string): Promise<IToolRelease[]> {
  const http: httpm.HttpClient = new httpm.HttpClient('tool-cache')

  //let versions: IToolRelease[] =
  return (await http.getJson<IToolRelease[]>(url)).result || []
  //return
}

export async function findFromManifest(
  versionSpec: string,
  stable: boolean,
  manifest: IToolRelease[]
): Promise<IToolRelease | undefined> {
  // wrap the internal impl
  const match: mm.IToolRelease | undefined = await mm._findMatch(
    versionSpec,
    stable,
    manifest
  )

  return match
}