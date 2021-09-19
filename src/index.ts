import fetch from 'node-fetch'
import { getPackageJson } from 'esm-requirer'
import { sleep } from 'time-helpers'
import admZip from 'adm-zip'

type TPapatcherSettings = {
  appPath: string
  filename: string
  apiUrl: string
}

type TLastVersionOpts = {
  tryLimit?: number
  tryIndex?: number
  tryDelay?: number
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
    const { tryIndex = 0, tryLimit = 1, tryDelay = 1e3 } = { ...opts }

    if (tryIndex > tryLimit) {
      return null
    }

    const { apiUrl } = this._settings
    const resp = await fetch(apiUrl, {})

    if (!resp?.ok) {
      await sleep(tryDelay)
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
    const { appPath } = this._settings
    const { needUpdate, downloadUrl } = await this.getInfo()

    if (!force && !needUpdate) {
      return
    }

    try {
      const resp = await fetch(downloadUrl)
      const zip = new admZip(await resp.buffer())
      zip.extractAllTo(appPath, true)

      return { result: resp.ok }
    } catch (error) {
      return { error }
    }
  }
}

export { Papatcher }
