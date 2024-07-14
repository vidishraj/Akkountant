import React, { useEffect, useState, useRef } from 'react'
import { ColDef } from 'ag-grid-community'
import AgGrid from '../../../commonComponents/agGridComponent/agGrid'
import { useGoldContext } from '../../../contexts/goldContext'
import style from './rateDisplay.module.scss'
import CloseIcon from '@mui/icons-material/Close'
import { convertLastUpdatedDate } from '../../mutualFundsPage/mutualFundsPage'

const GoldRateDisplay = ({ display, setDisplay }) => {
  const goldCtx = useGoldContext()
  const [goldRowData, setGoldRateData] = useState([])
  const dialogRef = useRef(null)
  function convertDataToRowData(data) {
    const rowData = Object.keys(data)
      .filter((key) => !isNaN(parseInt(key)))
      .map((key) => ({ goldType: key, goldValue: data[key] }))
    setGoldRateData(rowData)
  }

  useEffect(() => {
    if (display) {
      const favDialog: any = document.getElementById('favDialog')
      favDialog.showModal()
    }

    if (goldCtx?.goldData?.goldRateList && goldRowData.length === 0) {
      convertDataToRowData(goldCtx.goldData.goldRateList)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display])

  const columnDefs: ColDef[] = [
    {
      headerName: 'Gold Type (Carats)',
      field: 'goldType',
      suppressMovable: true,
      cellRenderer: (props) => {
        return <>{props.data.goldType}K</>
      },
    },
    {
      headerName: 'Gold Value (INR)',
      field: 'goldValue',
      valueFormatter: (params) => {
        const value = parseFloat(params.value).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        })
        return value
      },
      suppressMovable: true,
    },
  ]

  return (
    <>
      {display && (
        <dialog
          onClose={() => setDisplay(false)}
          id='favDialog'
          className={style.modal}
          ref={dialogRef}
        >
          <button
            className={style.closeButton}
            onClick={() => {
              setDisplay(false)
            }}
          >
            <CloseIcon style={{ width: '15px' }} />
          </button>
          <div
            className='ag-theme-alpine'
            style={{ height: '200px', width: '400px' }}
          >
            <AgGrid
              columnDefs={columnDefs}
              rowData={goldRowData}
              width={'100'}
              height={'100'}
            />
          </div>
          <caption className={style.caption}>
            {' '}
            Last Updated:{' '}
            {convertLastUpdatedDate(
              goldCtx?.goldData.goldRateList.lastUpdated,
            )}{' '}
          </caption>
        </dialog>
      )}
    </>
  )
}

export default GoldRateDisplay
