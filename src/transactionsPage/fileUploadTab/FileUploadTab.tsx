import React, { useEffect, useState } from 'react'
import {
  fetchFileStatus,
  FileUploadStatusResponse,
} from '../../api/transactionPageAPI'
import DarkModeLoader from '../../commonComponents/basicLoader/basicLoader'
import { useLoader } from '../../contexts/loaderContext'
import { useMessage } from '../../contexts/messageContext'
import AgGrid from '../../commonComponents/agGridComponent/agGrid'
import { fileUploadTableColumns } from './agGridColumns/agGridColDefs'
import FileUploadBox from './fileUploadBox/FileUploadBox'
import './FileUploadTab.css'
import RefreshIconBlack from '../../commonComponents/icons/refreshIconBlack'
import UploadTableLottie from '../../commonComponents/lottieAnimations/uploadAnimation'
import CalculatorPaperLottie from '../../commonComponents/lottieAnimations/calculatorPaperAnimation'

interface FileUploadTabProps {}

const FileUploadTab: React.FC<FileUploadTabProps> = (props) => {
  const { setPayload } = useMessage()
  const [rowData, setRowData] = useState<FileUploadStatusResponse>()
  const { status, setStatus } = useLoader()
  const [dropDownValue, setDropDownValue] = useState()

  useEffect(() => {
    fetchRowData(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchRowData = (userCalled: boolean) => {
    setStatus((prev) => ({
      ...prev,
      uploadPageStatus: true,
    }))
    fetchFileStatus(userCalled)
      .then((response) => {
        if (response.cached === false) {
          setPayload({
            message: `Fetched file status successfully`,
            type: 'success',
          })
        }
        response.data.Status.forEach(item=>{
          if(item['bank']){
            item['bank'] = item["bank"].replaceAll("_"," ")
          }
        })
        setRowData(response.data.Status)
      })
      .catch((error) => {
        setPayload({
          message: `Error occurred while fetching file status ${error.response.data.Error}`,
          type: 'error',
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          uploadPageStatus: false,
        }))
      })
  }

  function dropDownSelect(selection: any) {
    setDropDownValue(selection)
  }
  const colDef = fileUploadTableColumns(setPayload, fetchRowData, setStatus)

  return (
    <div style={{ height: '200vh', width: '100%' }}>
      <DarkModeLoader status={status.uploadPageStatus}>
        <div
          className='liveTableWrapper'
          style={{
            backgroundColor: 'whitesmoke',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: '1',
            height: '100vh',
          }}
        >
          <div className='uploadTableHeader'>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                backgroundColor: '',
                width: '100%',
              }}
            >
              <CalculatorPaperLottie
                style={{ height: '25vh', width: '10vw', backgroundColor: '' }}
              />
              <UploadTableLottie style={{ width: '10vw', height: '25vh' }} />
            </div>
            <div className='refreshContainer'>
              <button
                onClick={() => fetchRowData(true)}
                className='refresh-button'
                disabled={status.liveTableStatus}
              >
                <RefreshIconBlack width={20} height={20} />
              </button>
            </div>
          </div>
          <div className='gridDiv'>
            <AgGrid
              width={'85'}
              height={'75'}
              columnDefs={colDef}
              rowData={rowData}
            />
          </div>
        </div>
      </DarkModeLoader>
      <DarkModeLoader status={status.uploadBoxStatus}>
        <div className='uploadContainer'>
          <FileUploadBox
            refreshTable={fetchRowData}
            dropDownValue={dropDownValue}
            dropDownSelect={dropDownSelect}
          />
        </div>
      </DarkModeLoader>
    </div>
  )
}

export default FileUploadTab
