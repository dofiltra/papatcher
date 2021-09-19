import { Papatcher } from '.'

const debug = async () => {
  const papatcher = new Papatcher({
    appPath: '../',
    apiUrl: 'https://dofiltra.com/api/doproxificator?getVersion=true'
  })
  const currVersion = await papatcher.getCurrentVersion()

  const testVersion = '2.0.2'
//   console.log(currVersion, testVersion)
//   console.log('Need new version', currVersion < testVersion)
}

debug()
