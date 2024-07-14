import style from './ppfPage.module.scss'
import AgGrid from '../../commonComponents/agGridComponent/agGrid'
import { PPF, usePPFContext } from '../../contexts/ppfContext'
import { ColDef, ValueFormatterParams } from 'ag-grid-community'
import SavingsPPFAnimation from '../../commonComponents/lottieAnimations/savingsPPFAnimation'
import { Button } from '@mui/material'
import PPFSummaryBox from './ppfSummaryBox/ppfSummaryBox'
import PPFDepositDisplay from './ppfDialogs/ppfDepositDialog'
import { useState } from 'react'
import PPFInterestDisplay from './ppfDialogs/ppfInterestDialog'
import { useLoader } from '../../contexts/loaderContext'
import PPFLoaderAnimation from '../../commonComponents/lottieAnimations/ppfLoaderAnimation'
import { fetchPPF, updatePPF } from '../../api/investmentsAPI.tsx/ppfAPI'
import PPFDepositInsert from './ppfDialogs/ppfDepositInsertDialog'

const PPFPage = () => {
  const { ppfData, dispatch } = usePPFContext()
  const [displayDeposits, setDisplayDeposits] = useState(false)
  const [displayRates, setDisplayRates] = useState(false)
  const [displayInsertion, setDisplayInsertion] = useState(false)
  const { status, setStatus } = useLoader()
  const ppfColumnDefs: ColDef[] = [
    {
      headerName: 'Month',
      field: 'month',
      suppressMovable:true,
      sortable: true,
      filter: true,
      width: 180,
      sort: 'desc',
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
      headerName: 'Amount',
      field: 'amount',
      suppressMovable:true,
      sortable: true,
      filter: true,
      width: 200,
      cellClass: 'currency-cell',
      valueFormatter: (params) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(params.value)
      },
    },
    {
      headerName: 'Interest',
      field: 'interest',
      sortable: true,
      suppressMovable:true,
      filter: true,
      width: 200,
      cellClass: 'currency-cell',
      valueFormatter: (params) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(params.value)
      },
    },
    {
      headerName: 'Total',
      field: 'total',
      sortable: true,
      filter: true,
      suppressMovable:true,
      width: 200,
      cellClass: 'currency-cell',
      valueFormatter: (params) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(params.value)
      },
    },
  ]

  function recalculatePPFTable() {
    setStatus((prev) => ({
      ...prev,
      ppfBoxStatus: true,
    }))
    updatePPF()
      .then(() => {
        fetchPPF(false)
          .then((response) => {
            dispatch({
              type: 'UPDATE_PPF',
              payload: response.data.Message,
            })

            let change = 0
            let current = 0
            response.data.Message.map((element: PPF) => {
              change += element.interest
              return null
            })
            current =
              response.data.Message[response.data.Message.length - 1].total
            dispatch({
              type: 'UPDATE_PPF_SUMMARY',
              payload: {
                change: change,
                currentAmount: current,
              },
            })
          })
          .finally(() => {
            setStatus((prev) => ({
              ...prev,
              ppfBoxStatus: false,
            }))
          })
      })
      .catch(() => {
        setStatus((prev) => ({
          ...prev,
          ppfBoxStatus: false,
        }))
      })
  }

  return (
    <>
      {status.ppfBoxStatus ? (
        <PPFLoaderAnimation
          style={{ backgroundColor: 'white', height: '90vh', width: '100vw' }}
        />
      ) : (
        <div className={style.ppfPage}>
          <PPFInterestDisplay
            display={displayRates}
            setDisplay={setDisplayRates}
          />
          <PPFDepositDisplay
            display={displayDeposits}
            setDisplay={setDisplayDeposits}
          />
          <PPFDepositInsert
            display={displayInsertion}
            setDisplay={setDisplayInsertion}
          />
          <div className={style.topContainer}>
            <SavingsPPFAnimation
              style={{ height: '30vh', width: 'fit-content' }}
            />
            <PPFSummaryBox />
          </div>
          <div className={style.buttonAndTableContainer}>
            <div className={style.buttonContainer}>
              <Button
                className={style.depositButton}
                onClick={() => {
                  setDisplayDeposits(true)
                }}
              >
                {' '}
                Deposits
              </Button>
              <Button
                className={style.rateButton}
                onClick={() => {
                  setDisplayRates(true)
                }}
              >
                {' '}
                Interest Rates
              </Button>
              <Button
                className={style.insertButton}
                onClick={() => setDisplayInsertion(true)}
              >
                {' '}
                Insert Deposit
              </Button>
              <Button
                className={style.refreshButton}
                onClick={recalculatePPFTable}
              >
                {' '}
                Refresh Table
              </Button>
            </div>
            <div className={style.Container}>
              <div className={style.mainTable}>
                <AgGrid
                  domLayout='normal'
                  columnDefs={ppfColumnDefs}
                  rowData={ppfData.ppfList}
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

export default PPFPage
