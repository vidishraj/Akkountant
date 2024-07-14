import axios from '../../commonComponents/interceptor/interceptor'

export async function fetchFD(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-fd')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchFD', {
      id: 'fetch-fd',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function insertFDDeposit(body): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-fd')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/addFD', body, {
      id: 'insert-fd',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function deleteFDDeposit(body): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-fd')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/deleteFD', body, {
      id: 'delete-fd',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
