import axios from '../../commonComponents/interceptor/interceptor'

export async function fetchPF(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-pf')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchPF', {
      id: 'fetch-pf',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function fetchPFInterest(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-pf-interest')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchPFInterest', {
      id: 'fetch-pf-interest',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function fetchPFInterestRates(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-ppf-interest-rates')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchPFInterestRates', {
      id: 'fetch-pf-interest-rates',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function insertPF(body): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-pf-interest-rates')
  axios.storage.remove('fetch-pf-interest-')
  axios.storage.remove('fetch-pf')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/editPF', body, {
      id: 'edit-pf',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function recalculatePF(): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-pf-interest-rates')
  axios.storage.remove('fetch-pf-interest-')
  axios.storage.remove('fetch-pf')
  axios.storage.remove('recalculate-pf')
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/recalculatePF', {
      id: 'recalculate-pf',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
