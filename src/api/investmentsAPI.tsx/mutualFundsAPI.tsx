import axios from '../../commonComponents/interceptor/interceptor'

export async function fetchMutualFunds(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-mutual-funds')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchMf', {
      id: 'fetch-mutual-funds',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function fetchMutualFundsTransactions(): Promise<any> {
  let cacheInstace = {}
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchMfTransactions', {
      id: 'fetch-mf-transactions',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function fetchMutualFundsWithCode(code): Promise<any> {
  let cacheInstace = {}
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/fetchMfWithCode', code, {
      id: 'fetch-mf-with-code',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function insertMutualFunds(body): Promise<any> {
  axios.storage.remove('fetch-mutual-funds')
  axios.storage.remove('fetch-stocks-transactions')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/insertMf', body)
    .then((response) => {
      return response
    })
}

export async function addMutualFunds(body): Promise<any> {
  axios.storage.remove('fetch-mutual-funds')
  axios.storage.remove('fetch-stocks-transactions')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/addMf', body)
    .then((response) => {
      return response
    })
}

export async function sellMutualFunds(body): Promise<any> {
  axios.storage.remove('fetch-mutual-funds')
  axios.storage.remove('fetch-stocks-transactions')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/sellMf', body)
    .then((response) => {
      return response
    })
}

export async function refreshMutualFunds(): Promise<any> {
  axios.storage.remove('fetch-mutual-funds')
  axios.storage.remove('refresh-mf')
  let cacheInstace = {}
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/refreshMf', {
      id: 'refresh-mf',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
