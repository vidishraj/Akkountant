import style from './pfPage.module.scss'
import AgGrid from '../../commonComponents/agGridComponent/agGrid'
import { Button } from '@mui/material'
import { useState } from 'react'
import { useLoader } from '../../contexts/loaderContext'
import { ColDef } from 'ag-grid-community'
import { usePFContext } from '../../contexts/pfContext'
import PFInsertDialog from './pfDialogs/pfInsertDialog'
import PFInterestDialog from './pfDialogs/pfInterest'
import PFInterestRatesDialog from './pfDialogs/pfInterestRates'
import PFSummaryBox from './pfSummaryBox/pfSummaryBox'
import PfLottie from '../../commonComponents/lottieAnimations/pfAnimation'
import PFLoaderAnimation from '../../commonComponents/lottieAnimations/pfLoaderAnimation'
import { fetchPF, recalculatePF } from '../../api/investmentsAPI.tsx/pfAPI'
const PFPage = () => {
  const { status, setStatus } = useLoader()
  const { pfData, dispatch } = usePFContext()
  const [displayInsertDialog, setDisplayInsert] = useState(false)
  const [displayInterestDialog, setDisplayInterest] = useState(false)
  const [displayInterestRatesDialog, setDisplayInterestRates] = useState(false)
  function recalculatePFTable() {
    setStatus((prev) => ({
      ...prev,
      pfBoxStatus: true,
    }))
    recalculatePF()
      .then(() => {
        fetchPF(true).then((response) => {
          dispatch({
            type: 'UPDATE_PF',
            payload: response.data.Message,
          })
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          pfBoxStatus: false,
        }))
      })
  }

  const pfColumnDefs: ColDef[] = [
    {
      headerName: 'Month',
      field: 'wageMonth',
      sortable: true,
      suppressMovable:true,
      comparator: (date1, date2) => {
        const [monthA, yearA] = date1.split('-')
        const [monthB, yearB] = date2.split('-')

        const months: Record<string, number> = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        }

        const monthIndexA = months[monthA]
        const monthIndexB = months[monthB]

        if (yearA !== yearB) {
          return parseInt(yearA) - parseInt(yearB)
        }

        return monthIndexA - monthIndexB
      },
      sort: 'desc',
      sortingOrder: ['desc', 'asc'],
    },
    {
      field: 'EPFWage',
      headerName: 'Month Wage',
      editable: true,
      suppressMovable:true,
      valueGetter: (params) => {
        return params.data.EPFWage.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        })
      },
    },
    {
      field: 'empShare',
      headerName: 'Employee Share',
      editable: true,
      suppressMovable:true,
      valueGetter: (params) => {
        return params.data.empShare.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        })
      },
    },
    {
      field: 'emplyrShare',
      headerName: 'Employer Share',
      editable: true,
      suppressMovable:true,
      valueGetter: (params) => {
        return params.data.emplyrShare.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        })
      },
    },
    {
      field: 'total',
      headerName: 'Total',
      editable: true,
      suppressMovable:true,
      valueGetter: (params) => {
        return params.data.total.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        })
      },
    },
  ]
  return (
    <>
      {status.pfBoxStatus ? (
        <PFLoaderAnimation
          style={{ backgroundColor: 'white', height: '90vh', width: '100vw' }}
        />
      ) : (
        <div className={style.ppfPage}>
          <PFInsertDialog
            display={displayInsertDialog}
            setDisplay={setDisplayInsert}
          />
          <PFInterestDialog
            display={displayInterestDialog}
            setDisplay={setDisplayInterest}
          />
          <PFInterestRatesDialog
            display={displayInterestRatesDialog}
            setDisplay={setDisplayInterestRates}
          />
          <div className={style.topContainer}>
            <PfLottie style={{ height: '30vh', width: 'fit-content' }} />
            <PFSummaryBox />
          </div>
          <div className={style.buttonAndTableContainer}>
            <div className={style.buttonContainer}>
              <Button
                className={style.rateButton}
                onClick={() => {
                  setDisplayInsert(true)
                }}
              >
                {' '}
                {pfData?.pfList?.length !== 0
                  ? 'Edit Transaction'
                  : 'Insert Transactions'}
              </Button>
              <Button
                className={style.depositButton}
                onClick={() => {
                  setDisplayInterest(true)
                }}
              >
                {' '}
                View Interests
              </Button>
              <Button
                className={style.insertButton}
                onClick={() => setDisplayInterestRates(true)}
              >
                {' '}
                View Interest Rates
              </Button>
              <Button
                className={style.refreshButton}
                onClick={recalculatePFTable}
              >
                {' '}
                Refresh Table
              </Button>
            </div>
            <div className={style.Container}>
              <div className={style.mainTable}>
                <AgGrid
                  domLayout='normal'
                  columnDefs={pfColumnDefs}
                  rowData={pfData.pfList}
                  width={'86'}
                  height={'75'}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PFPage
