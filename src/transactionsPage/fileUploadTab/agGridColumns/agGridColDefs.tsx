import { ColDef } from 'ag-grid-community'
import {
  callFileRenamer,
  downloadFile,
  fileDeleted,
} from '../../../api/transactionPageAPI'
import DeleteFileIcon from '../../../commonComponents/icons/deleteFileIcon'
import DownloadFileIcon from '../../../commonComponents/icons/downloadFileIcon'
import { bankRenderer, dateFormatter } from '../../transactionTable/agGridColumns/agGridColDefs'

function deleteFile(params, setPayload) {
  let rowData = params.data
  let formData = new FormData()
  formData.append('driveID', rowData.GDriveID)
  formData.append('fileType', rowData.bank)
  return fileDeleted(formData)
    .then((response) => {
      if (response === 200) {
        setPayload({
          message: `File deletion successful`,
          type: 'success',
        })
      }
    })
    .catch((error) => {
      setPayload({
        message: `File deletion failed ${error.response.data.Error}`,
        type: 'error',
      })
    })
}

function fileDownloader(params, setPayload) {
  let formData = new FormData()
  let rowData = params.data
  formData.append('fileID', rowData.GDriveID)
  formData.append('fileName', rowData.fileName)
  return downloadFile(formData)
    .then((response: any) => {
      return response.data
    })
    .then((blob: any) => {
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', rowData.fileName) // Specify the filename
      document.body.appendChild(link)
      link.click()
      setPayload({
        message: 'Download started successfully',
        type: 'success',
      })
      document.body.removeChild(link)
    })
    .catch((error) => {
      setPayload({
        message: `File download failed ${error.response.data.Error}`,
        type: 'error',
      })
    })
}

function fileRenamed(params, setPayload) {
  let rowData = params.data
  let formData = new FormData()
  formData.append('driveID', rowData.GDriveID)
  formData.append('oldName', params.oldValue)
  formData.append('name', params.newValue);
  if (rowData.status === 'Uploaded to Cloud') {
    formData.append('uploaded', 'True')
  } else {
    formData.append('uploaded', 'False')
  }
  return callFileRenamer(formData)
    .then((response) => {
      if (response === 200) {
        setPayload({
          message: 'File renamed successfully',
          type: 'success',
        })
      } else {
        setPayload({
          message: `File renamed failed. ${response}`,
          type: 'warning',
        })
      }
    })
    .catch((error) => {
      setPayload({
        message: `File rename failed. ${error.response.data.Error}`,
        type: 'error',
      })
    })
}

export function fileUploadTableColumns(
  payloadSetter,
  refreshTable: any,
  setStatus,
): ColDef[] {
  return [
    {
      headerName: 'Cloud ID',
      field: 'GDriveID',
      minWidth: 150,
      hide: true,
    },
    {
      headerName: 'Name',
      field: 'fileName',
      minWidth: 150,
      editable: true,
      onCellValueChanged: (params) => {
        setStatus((prev) => ({
          ...prev,
          uploadPageStatus: true,
        }))
        fileRenamed(params, payloadSetter)
          .then((response) => refreshTable(true))
          .finally(() => {
            setStatus((prev) => ({
              ...prev,
              uploadPageStatus: false,
            }))
          })
      },
    },
    {
      headerName: 'Bank',
      field: 'bank',
      minWidth: 120,
      sortable: true,
      cellRenderer: bankRenderer,
      // width:120
    },
    {
      headerName: 'Size',
      field: 'fileSize',
      minWidth: 100,
      // width:90
    },
    {
      headerName: 'Upload Date',
      minWidth: 150,
      field: 'uploadDate',
      cellRenderer: dateFormatter,
      // width:110
    },
    {
      headerName: 'Transactions',
      minWidth: 100,
      field: 'transactionCount',
      // width:110
      sortable: true,
    },
    {
      headerName: 'Status',
      minWidth: 150,
      hide: true,
      field: 'status',
      // width:160
    },
    {
      headerName: 'Download',
      minWidth: 80,
      // width:160,
      onCellClicked: (parentParams) => {
        setStatus((prev) => ({
          ...prev,
          uploadPageStatus: true,
        }))
        fileDownloader(parentParams, payloadSetter).finally(() => {
          setStatus((prev) => ({
            ...prev,
            uploadPageStatus: false,
          }))
        })
      },
      cellRenderer: () => {
        return <DownloadFileIcon width={20} height={20} />
      },
    },
    {
      headerName: 'Delete',
      // width:160,
      minWidth: 80,
      hide:true,
      onCellClicked: (params) => {
        setStatus((prev) => ({
          ...prev,
          uploadPageStatus: true,
        }))
        deleteFile(params, payloadSetter)
          .then(() => refreshTable(true))
          .finally(() => {
            setStatus((prev) => ({
              ...prev,
              uploadPageStatus: false,
            }))
          })
      },
      cellRenderer: (params) => {
        return <DeleteFileIcon width={20} height={20} />
      },
    },
  ]
}
