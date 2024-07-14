import axios from '../commonComponents/interceptor/interceptor'

export function makeInitialRequest() {
  let localStorage = window.localStorage
  let authUrl = localStorage.getItem('oauth_uri')
  let redirect_uri = localStorage.getItem('redirect_uri')
  let client_id = localStorage.getItem('client_id')
  let AuthUrl = `${authUrl}?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly&response_type=code&redirect_uri=${redirect_uri}&client_id=${client_id}&prompt=consent&access_type=offline`
  window.location.href = AuthUrl
}

export function makeDriveInitialRequest() {
  let localStorage = window.localStorage
  let authUrl = localStorage.getItem('oauth_uri')
  let redirect_uri = localStorage.getItem('redirect_uri')
  let client_id = localStorage.getItem('client_id')
  let AuthUrl = `${authUrl}?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&response_type=code&redirect_uri=${redirect_uri}&client_id=${client_id}&prompt=consent&access_type=offline`
  window.location.href = AuthUrl
}

export async function makeTokenRequest(code) {
  let localStorage = window.localStorage
  let clientId = localStorage.getItem('client_id')
  let clientSecret = localStorage.getItem('client_secret')
  let redirectUri = localStorage.getItem('redirect_uri')
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code`,
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    response.json().then((responseBody) => {
      let newRequest = {
        ...responseBody,
        client_id: clientId,
        client_secret: clientSecret,
      }
      return updateGmailToken(newRequest)
    })
  } catch (error) {
    return
  }
}

export async function makeDriveTokenRequest(code) {
  let localStorage = window.localStorage
  let clientId = localStorage.getItem('client_id')
  let clientSecret = localStorage.getItem('client_secret')
  let redirectUri = localStorage.getItem('redirect_uri')
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code`,
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    response.json().then((responseBody) => {
      let newRequest = {
        ...responseBody,
        client_id: clientId,
        client_secret: clientSecret,
      }
      return updateDriveToken(newRequest)
    })
  } catch (error) {
    return
  }
}

export async function updateGmailToken(body) {
  return axios.post(
    `${process.env.REACT_APP_BACKENDURL}/updateGmailToken`,
    body,
  )
}

export async function updateDriveToken(body) {
  return axios.post(
    `${process.env.REACT_APP_BACKENDURL}/updateGDriveToken`,
    body,
  )
}
