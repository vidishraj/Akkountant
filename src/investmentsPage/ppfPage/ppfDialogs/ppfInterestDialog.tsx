import React, { useEffect, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import style from './ppfDialogs.module.scss'
import { ColDef, ValueFormatterParams } from 'ag-grid-community'
import { usePPFContext } from '../../../contexts/ppfContext'
import AgGrid from '../../../commonComponents/agGridComponent/agGrid'

const PPFInterestDisplay = ({ display, setDisplay }) => {
  const dialogRef = useRef(null)
  const ppfData = usePPFContext().ppfData
  useEffect(() => {
    if (display) {
      const favDialog: any = document.getElementById('favDialog')
      favDialog.showModal()
    }
  }, [display])
  const ppfInterestColumnDefs: ColDef[] = [
    {
      headerName: 'Month',
      field: 'month',
      sortable: true,
      filter: true,
      width: 180,
      sort: 'desc',
      suppressMovable:true,
      valueFormatter: (params: ValueFormatterParams) => {
        const [month, year] = params.value.split('-')
        const dateValue = new Date(`${month} 1, ${year}`)
        return dateValue.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      },
      comparator: (date1: string, date2: string) => {
        return new Date(date1).getTime() - new Date(date2).getTime()
      },
    },
    {
      headerName: 'Interest',
      field: 'interest',
      suppressMovable:true,
      sortable: true,
      filter: true,
      width: 180,
      cellRenderer: (props) => {
        return <div>{props.data.interest} %</div>
      },
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
              columnDefs={ppfInterestColumnDefs}
              rowData={ppfData.ppfInterestList}
              width={'100'}
              height={'100'}
            />
          </div>
        </dialog>
      )}
    </>
  )
}

export default PPFInterestDisplay
