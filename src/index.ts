import { getPackageJson } from 'esm-requirer'
import { sleep } from 'time-helpers'

type TPapatcherSettings = {
  appPath: string
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

  async needUpdate() {
    const currVersion = await this.getCurrentVersion()
    const lastVersion = await this.getLastVersion()

    return currVersion < lastVersion
  }
}

export { Papatcher }
