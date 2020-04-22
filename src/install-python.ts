import * as path from 'path';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces'

const AUTH_TOKEN = core.getInput('token');
const OWNER = 'actions';
const REPO = 'python-versions';

const IS_WINDOWS = process.platform === 'win32';
const IS_LINUX = process.platform === 'linux';

export async function findReleaseFromManifest(semanticVersionSpec: string): Promise<tc.IToolRelease | undefined> {
  const manifest: tc.IToolRelease[] = await tc.getManifestFromRepo(OWNER, REPO, AUTH_TOKEN);
  return await tc.findFromManifest(semanticVersionSpec, true, manifest);
}

export async function installCpythonFromRelease (release: tc.IToolRelease) {
  const downloadUrl = release.files[0].download_url;
  const pythonPath = await tc.downloadTool(downloadUrl);
  const fileName = path.basename(pythonPath, '.zip');
  const pythonExtractedFolder = await tc.extractZip(pythonPath, `./${fileName}`);
  
  const options: ExecOptions = {
    cwd: pythonExtractedFolder,
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString().trim());
      }
    }
  }
  
  if (IS_WINDOWS) {
    await exec.exec('powershell', ['./setup.ps1'], options);
  } else if (IS_LINUX) {
    await exec.exec('sudo', ['bash', './setup.sh'], options);
  } else {
    await exec.exec('bash', ['./setup.sh'], options);
  }
}