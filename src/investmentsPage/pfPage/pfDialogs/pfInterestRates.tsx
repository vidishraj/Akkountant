import style from './pfDialogs.module.scss'
import CloseIcon from '@mui/icons-material/Close'
import { useRef, useEffect } from 'react'
import AgGrid from '../../../commonComponents/agGridComponent/agGrid'
import { usePFContext } from '../../../contexts/pfContext'
import { ColDef } from 'ag-grid-community'

const PFInterestRatesDialog = ({ display, setDisplay }) => {
  const dialogRef = useRef(null)
  const pfInterestRatesColumn: ColDef[] = [
    {
      headerName: 'Year',
      field: 'year',
      suppressMovable:true,
    },
    {
      headerName: 'Interest',
      field: 'interestRate',
      suppressMovable:true,
    },
  ]
  const pfCtx = usePFContext()
  useEffect(() => {
    if (display) {
      const favDialog: any = document.getElementById('favDialog')
      favDialog.showModal()
    }
  }, [display])
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
            style={{ height: '400px', width: '400px' }}
          >
            <AgGrid
              columnDefs={pfInterestRatesColumn}
              rowData={pfCtx.pfData.pfInterestList}
              width={'100'}
              height={'100'}
            />
          </div>
        </dialog>
      )}
    </>
  )
}

export default PFInterestRatesDialog
