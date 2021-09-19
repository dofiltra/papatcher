import { Papatcher } from '.'

const debug = async () => {
  const papatcher = new Papatcher({
    appPath: '../',
    apiUrl: 'https://dofiltra.com/api/papatcher?appName=doproxificator'
  })
  // console.log('Need new version', await papatcher.getInfo())
  // console.log(await papatcher.update())
}

debug()
