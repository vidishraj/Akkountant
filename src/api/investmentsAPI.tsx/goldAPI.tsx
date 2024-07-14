import axios from '../../commonComponents/interceptor/interceptor'

export async function fetchGold(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-gold')
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchGold', {
      id: 'fetch-gold',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function fetchGoldRates(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-gold-rate')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchGoldRates', {
      id: 'fetch-gold-rate',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function insertGoldDeposit(body): Promise<any> {
  axios.storage.remove('fetch-gold')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/insertGoldDeposit', body)
    .then((response) => {
      return response
    })
}
export async function deleteGoldDeposit(body): Promise<any> {
  axios.storage.remove('fetch-gold')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/deleteGoldDeposit', body)
    .then((response) => {
      return response
    })
}
export async function recalibrateGoldRates(): Promise<any> {
  axios.storage.remove('fetch-gold-rate')
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/recalibrateGoldRates')
    .then((response) => {
      return response
    })
}
