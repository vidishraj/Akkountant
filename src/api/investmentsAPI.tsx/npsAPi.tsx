import axios from '../../commonComponents/interceptor/interceptor'

export async function fetchNPS(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-nps')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchNPS', {
      id: 'fetch-nps',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function fetchNPSTransactions(): Promise<any> {
  let cacheInstace = {}
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchNPSTransactions', {
      id: 'fetch-nps-transactions',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function fetchNPSWithCode(body): Promise<any> {
  let cacheInstace = {}
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/fetchNPSScheme', body, {
      id: 'fetch-nps-with-code',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function insertNPS(body): Promise<any> {
  axios.storage.remove('fetch-nps')
  axios.storage.remove('fetch-nps-transactions')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/insertNPS', body)
    .then((response) => {
      return response
    })
}

export async function addNPS(body): Promise<any> {
  axios.storage.remove('fetch-nps')
  axios.storage.remove('fetch-nps-transactions')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/addNPS', body)
    .then((response) => {
      return response
    })
}

export async function sellNPS(body): Promise<any> {
  axios.storage.remove('fetch-nps')
  axios.storage.remove('fetch-nps-transactions')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/sellNPS', body)
    .then((response) => {
      return response
    })
}

export async function refreshNPS(): Promise<any> {
    axios.storage.remove('fetch-nps')
  axios.storage.remove('refresh-nps')
  let cacheInstace = {}
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/refreshNPS', {
      id: 'refresh-nps',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
