import axios from '../../commonComponents/interceptor/interceptor'

export async function fetchPPF(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-ppf')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchPPF', {
      id: 'fetch-ppf',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function fetchPPFDeposit(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-ppf-deposit')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchPPFDeposit', {
      id: 'fetch-ppf-deposit',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function fetchPPFInterest(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-ppf-interest')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchPPFInterest', {
      id: 'fetch-ppf-interest',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function updatePPF(): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-ppf')
  axios.storage.remove('fetch-ppf-interest')
  axios.storage.remove('fetch-ppf-deposit')
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/updatePPF', {
      id: 'update-ppf',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function insertPPF(body): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-ppf')
  axios.storage.remove('fetch-ppf-interest')
  axios.storage.remove('fetch-ppf-deposit')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/insertPPF', body, {
      id: 'insert-ppf',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function deletePPF(body): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-ppf')
  axios.storage.remove('fetch-ppf-interest')
  axios.storage.remove('fetch-ppf-deposit')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/deletePPFDeposit', body, {
      id: 'delete-ppf',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
