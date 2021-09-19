import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { getPackageJson } from 'esm-requirer'
import { sleep } from 'time-helpers'
import DecompressZip from 'decompress-zip'

type TPapatcherSettings = {
  appPath: string
  filename: string
  apiUrl: string
}

type TLastVersionOpts = {
  tryLimit?: number
  tryIndex?: number
}

class Papatcher {
  private _settings: TPapatcherSettings

  constructor(s: TPapatcherSettings) {
    this._settings = {
      ...s
    }
  }

  async getCurrentVersion() {
    const pack = await getPackageJson(this._settings.appPath)
    return pack.version
  }

  async getLastVersion(opts?: TLastVersionOpts): Promise<any> {
    const { tryIndex = 0, tryLimit = 1 } = { ...opts }

    if (tryIndex > tryLimit) {
      return null
    }

    const { apiUrl } = this._settings
    const resp = await fetch(apiUrl, {})

    if (!resp?.ok) {
      await sleep(1e3)
      return await this.getLastVersion({
        ...opts,
        tryIndex: tryIndex + 1
      })
    }

    return await resp.json()
  }

  async getInfo() {
    const currVersion = await this.getCurrentVersion()
    const { version, downloadUrl } = await this.getLastVersion()

    return { needUpdate: currVersion < version, downloadUrl }
  }

  async update(force = false) {
    const { appPath, filename } = this._settings
    const { needUpdate, downloadUrl } = await this.getInfo()

    if (!force && !needUpdate) {
      return
    }

    try {
      const resp = await fetch(downloadUrl)
      const filepath = path.join(appPath, filename)
      const dest = fs.createWriteStream(filepath)
      console.log(filepath)

      resp.body?.pipe(dest)
      await sleep(10e3)
      this.unzip(filepath)

      return { result: !!resp.body }
    } catch (error) {
      return { error }
    }
  }

  private unzip(filepath: string) {
    const unzipper = new DecompressZip(filepath)
    unzipper.on('error', function (err: any) {
      console.log('Caught an error')
    })

    unzipper.on('extract', function (log: any) {
      console.log('Finished extracting')
    })

    unzipper.on('progress', function (fileIndex: number, fileCount: number) {
      console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount)
    })

    unzipper.extract({
      path: filepath,
      filter: function (file: File) {
        return file.type !== 'SymbolicLink'
      }
    })
  }
}

export { Papatcher }
