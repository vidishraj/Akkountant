import axios from '../commonComponents/interceptor/interceptor'

export async function fetchTrips(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-trip')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchTrips', {
      id: 'fetch-fd',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function insertTrip(body): Promise<any> {
  axios.storage.remove('fetch-trip')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/createTrip', body)
    .then((response) => {
      return response
    })
}
export async function fetchUsersForATrip(
  userCalled: boolean,
  tripId: number,
): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('summary')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchUsersForTrip', {
      params: {
        trip: tripId,
      },
      id: 'summary',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function insertUser(body): Promise<any> {
  axios.storage.remove('summary')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/createUser', body)
    .then((response) => {
      return response
    })
}
