import { Papatcher } from '.'

const debug = async () => {
  const papatcher = new Papatcher({
    appPath: '../',
    filename: 'doproxificator.zip',
    apiUrl: 'https://dofiltra.com/api/doproxificator?getVersion=true'
  })
  //   console.log('Need new version', await papatcher.getInfo())
  console.log(await papatcher.update())
}

debug()
