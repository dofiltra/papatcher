import { getPackageJson } from 'esm-requirer'

type TPapatcherSettings = {
  appPath: string
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
}

export { Papatcher }
