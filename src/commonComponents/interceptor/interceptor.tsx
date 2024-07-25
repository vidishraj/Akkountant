import Axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'
import {
  makeDriveInitialRequest,
  makeInitialRequest,
} from '../../api/googleAuthAPI'

const instance = Axios.create()
const axios = setupCache(instance, { debug: console.log })

axios.interceptors.request.use(
  (config) => {
    config.headers.setAuthorization(process.env.REACT_APP_API_KEY)
    return config
  },
  (error) => Promise.reject(error)
)

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url :string = error.config.url;

    if (error?.response?.data?.Auth) {
      let authList = error.response.data.Auth
      window.localStorage.removeItem('redirect_uri')
      window.localStorage.setItem(
        'redirect_uri',
        'https%3A%2F%2Fakkountant.netlify.app%2Fhome',
      )
      // window.localStorage.setItem(
      //   'redirect_uri',
      //   'http%3A%2F%2Flocalhost:3000%2Fhome',
      // )
      window.localStorage.removeItem('client_secret')
      window.localStorage.setItem('client_secret', authList.client_secret)
      window.localStorage.removeItem('client_id')
      window.localStorage.setItem('client_id', authList.client_id)
      window.localStorage.removeItem('oauth_uri')
      window.localStorage.setItem('oauth_uri', authList.auth_uri)
      window.localStorage.removeItem('token_uri')
      window.localStorage.setItem('token_uri', authList.token_uri)
      if (url.substring(url.lastIndexOf('/')+1, url.length) === "readEmail") {
        makeInitialRequest()
      } else {
        makeDriveInitialRequest()
      }
    }
    return Promise.reject(error)
  }
)

export default axios
