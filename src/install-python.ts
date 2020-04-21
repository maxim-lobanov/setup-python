import * as toolcache from './tool-cache';

import * as path from 'path';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces'

const MANIFEST_URL = "https://raw.githubusercontent.com/actions/python-versions/master/versions-manifest.json"
const IS_WINDOWS = process.platform === 'win32';

export async function findReleaseFromManifest(semanticVersionSpec: string): Promise<toolcache.IToolRelease | undefined> {
  const manifest: toolcache.IToolRelease[] = await toolcache.getManifestFromUrl(MANIFEST_URL);
  return await toolcache.findFromManifest(semanticVersionSpec, true, manifest);
}

export async function installCpythonFromRelease (release: toolcache.IToolRelease) {
  const downloadUrl = release.files[0].download_url;
  const pythonPath = await tc.downloadTool(downloadUrl);
  const fileName = path.basename(pythonPath, '.zip');
  const pythonExtractedFolder = await tc.extractZip(pythonPath, `./${fileName}`);
  
  const options: ExecOptions = {
    cwd: pythonExtractedFolder,
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString());
      }
    }
  }
  
  if (IS_WINDOWS) {
    await exec.exec('pwsh', ['./setup.ps1'], options);
  } else {
    await exec.exec('sh', ['./setup.sh'], options);
  }
}