import React, { useEffect, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import style from './ppfDialogs.module.scss'
import {
  CellClickedEvent,
  ColDef,
  ValueFormatterParams,
} from 'ag-grid-community'
import { usePPFContext } from '../../../contexts/ppfContext'
import AgGrid from '../../../commonComponents/agGridComponent/agGrid'
import { deletePPF, updatePPF } from '../../../api/investmentsAPI.tsx/ppfAPI'
import DeleteFileIcon from '../../../commonComponents/icons/deleteFileIcon'
import { useLoader } from '../../../contexts/loaderContext'

const PPFDepositDisplay = ({ display, setDisplay }) => {
  const dialogRef = useRef(null)
  const { setStatus } = useLoader()
  const ppfData = usePPFContext().ppfData
  const formatDate = (dateString: string): string => {
    const [day, month, year] = dateString.split('/')
    const dateValue = new Date(`${month}/${day}/${year}`)
    return dateValue.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  useEffect(() => {
    if (display) {
      const favDialog: any = document.getElementById('favDialog')
      favDialog.showModal()
    }
  }, [display])
  const ppfDepositColumnDefs: ColDef[] = [
    {
      field: 'id',
      hide: true
    },
    {
      headerName: 'Deposit Date',
      field: 'depositDate',
      sortable: true,
      filter: true,
      suppressMovable:true,
      width: 180,
      valueFormatter: (params: ValueFormatterParams) =>
        formatDate(params.value as string),
    },
    {
      headerName: 'Amount',
      field: 'amount',
      sortable: true,
      suppressMovable:true,
      filter: true,
      width: 150,
      cellClass: 'currency-cell',
      valueFormatter: (params: ValueFormatterParams) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(params.value as number),
    },
    {
      headerName: 'Delete',
      minWidth: 80,
      suppressMovable:true,
      onCellClicked: (params: CellClickedEvent<any, any>) => {
        setStatus((prev) => ({
          ...prev,
          ppfBoxStatus: true,
        }))
        deletePPF(params.data.id)
          .then(() =>
            updatePPF().finally(() => {
              setStatus((prev) => ({
                ...prev,
                ppfBoxStatus: false,
              }))
            }),
          )
          .catch(() => {
            setStatus((prev) => ({
              ...prev,
              ppfBoxStatus: false,
            }))
          })
      },
      cellRenderer: (params) => {
        return <DeleteFileIcon width={20} height={20} />
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
              columnDefs={ppfDepositColumnDefs}
              rowData={ppfData.ppfDepositList}
              width={'100'}
              height={'100'}
            />
          </div>
        </dialog>
      )}
    </>
  )
}

export default PPFDepositDisplay
