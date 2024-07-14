import axios from '../commonComponents/interceptor/interceptor'
export interface FileUploadStatusResponse {
  bank: string
  fileID: string
  fileName: string
  fileSize: number
  fileSr: number
  status: string
  transactionCount: number
  uploadDate: string
}

export async function fetchFileStatus(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-file-status')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/getFileStatus', {
      id: 'fetch-file-status',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function allBanksData(userCalled: boolean) {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-all')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchAll', {
      id: 'fetch-all',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function updateTag(body) {
  axios.storage.remove('fetch-all')
  //changeTag
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/changeTag', body)
    .then((response) => {
      return response.data
    })
}

export async function updateLiveTag(body) {
  axios.storage.remove('fetch-live-table')
  //changeTag
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/updateLiveTableTag', body)
    .then((response) => {
      return response.data
    })
}

export async function updateCreditForLiveTable(body) {
  axios.storage.remove('fetch-live-table')
  //changeCreditInfo
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/updateCreditInfo', body)
    .then((response) => {
      return response.data
    })
}

export async function fetchLiveTable(userCalled: boolean) {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-live-table')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchLiveTable', {
      id: 'fetch-live-table',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function readEmails(body) {
  axios.storage.remove('fetch-live-table')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/readEmail', body)
    .then((response) => {
      return response
    })
}

export async function fileDeleted(body) {
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/deleteFile', body)
    .then((response) => {
      return response.status
    })
}

export async function downloadFile(body) {
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/downloadFile', body, {
      responseType: 'blob',
    })
    .then((response) => {
      return response
    })
}

export async function callFileRenamer(body) {
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/renameFile', body)
    .then((response) => {
      return response.status
    })
}

export async function fileUploader(body) {
  return await axios
    .post(`${process.env.REACT_APP_BACKENDURL}/uploadStatement`, body)
    .then((response) => {
      return response
    })
}

export async function addAutoTag(details:string, tag:string){
  const body={
    details:details,
    tag:tag
  }
  return await axios.post(`${process.env.REACT_APP_BACKENDURL}/addAutoTag`,body);
}
