import style from './pfDialogs.module.scss'
import CloseIcon from '@mui/icons-material/Close'
import { useRef, useEffect, useState } from 'react'
import AgGrid from '../../../commonComponents/agGridComponent/agGrid'
import { usePFContext } from '../../../contexts/pfContext'
import { ColDef } from 'ag-grid-community'
import {
  Button,
  FilledInput,
  FormControl,
  InputAdornment,
  InputLabel,
} from '@mui/material'
import { fetchPF, insertPF } from '../../../api/investmentsAPI.tsx/pfAPI'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useLoader } from '../../../contexts/loaderContext'

const PFInsertDialog = ({ display, setDisplay }) => {
  const dialogRef = useRef(null)
  const { setStatus } = useLoader()
  const [empContribution, setEmpContribution] = useState<string>('')
  const [emplyrContribution, setEmplyrContribution] = useState<string>('')
  const [EPFWage, setEPFWage] = useState<string>('')
  const [error, setError] = useState<boolean>(false)
  const [firstItem, setFirstItem] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<string>()
  const [saveCalled, setSaveCalled] = useState<boolean>(false)
  const pfCtx = usePFContext()

  useEffect(() => {
    if (display) {
      const favDialog: any = document.getElementById('favDialog')
      favDialog.showModal()
    }
    if (pfCtx?.pfData?.pfList.length === 0) {
      setFirstItem(true)
    } else {
      setFirstItem(false)
    }
  }, [display, pfCtx.pfData.pfList])

  const pfDepositColumnDefs: ColDef[] = [
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
      suppressMovable:true,
      editable: true,
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
      valueGetter: (params) => {
        return params.data.empShare.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        })
      },
      suppressMovable:true,
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
  ]

  const getNextMonthYear = (monthYear: string): string => {
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

    const [month, yearStr] = monthYear.split('-')
    const year = parseInt(yearStr, 10)

    if (months.hasOwnProperty(month)) {
      const monthIndex = months[month]
      const date = new Date(year, monthIndex)
      date.setMonth(date.getMonth() + 1)

      const nextMonth = date.toLocaleString('default', { month: 'short' })
      const nextYear = date.getFullYear()

      return `${nextMonth.slice(0, 3)}-${nextYear}`
    }

    return 'Invalid input'
  }

  function insertNextRow() {
    if (!EPFWage || !empContribution || !emplyrContribution) {
      setError(true)
    } else {
      let nextMonth = ''
      if (pfCtx.pfData.pfList.length === 0) {
        let currentDate = selectedDate.toString()
        nextMonth = getNextMonthYear(
          `${currentDate.slice(4, 7)}-${currentDate.slice(11, 15)}`,
        )
      } else {
        nextMonth = getNextMonthYear(
          sortedData(pfCtx.pfData.pfList)[pfCtx.pfData.pfList.length - 1]
            .wageMonth,
        )
      }
      pfCtx.dispatch({
        type: 'ADD_PF',
        payload: [
          {
            EPFWage: EPFWage,
            emplyrShare: emplyrContribution,
            empShare: empContribution,
            wageMonth: nextMonth,
            total: 0,
          },
        ],
      })
    }
    setError(false)
  }

  function clearPFEntry() {
    pfCtx.dispatch({
      type: 'CLEAR_PF',
    })
    fetchPF(true).then((response) => {
      pfCtx.dispatch({
        type: 'UPDATE_PF',
        payload: response.data.Message,
      })
    })
    setDisplay(false)
  }

  function savePf() {
    setStatus((prev) => ({
      ...prev,
      pfBoxStatus: true,
    }))
    let body = {}
    let rows = []
    setSaveCalled(true)
    sortedData(pfCtx.pfData.pfList).forEach((element) => {
      rows.push([
        element.wageMonth,
        parseFloat(element.EPFWage.toString()),
        parseFloat(element.empShare.toString()),
        parseFloat(element.emplyrShare.toString()),
      ])
    })
    body['rows'] = rows
    insertPF(body)
      .then((response) => {})
      .finally(() => {
        setDisplay(false)
        setStatus((prev) => ({
          ...prev,
          pfBoxStatus: false,
        }))
      })
  }

  return (
    <>
      {display && (
        <dialog
          onClose={() => clearPFEntry()}
          id='favDialog'
          className={style.modal}
          style={{ width: '70vw', height: '60vh', zIndex: '5' }}
          ref={dialogRef}
        >
          <button
            className={style.closeButton}
            onClick={() => {
              setDisplay(false)
              if (!saveCalled) {
                clearPFEntry()
              }
            }}
          >
            <CloseIcon style={{ width: '15px' }} />
          </button>
          <div className={style.inputContainer}>
            {firstItem && (
              <FormControl sx={{ m: 1 }} variant='filled'>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    views={['year', 'month']}
                    label='Month and Year'
                    sx={{ width: '150px' }}
                    value={selectedDate}
                    disableOpenPicker
                    onChange={(e) => setSelectedDate(e)}
                  />
                </LocalizationProvider>
              </FormControl>
            )}
            <FormControl sx={{ m: 1 }} variant='filled'>
              <InputLabel htmlFor='filled-adornment-amount'>
                EPF Wage
              </InputLabel>
              <FilledInput
                id='filled-adornment-amount'
                style={{ width: '150px' }}
                startAdornment={
                  <InputAdornment position='start'>&#x20B9;</InputAdornment>
                }
                value={EPFWage}
                onChange={(e) => setEPFWage(e.target.value)}
                error={error}
              />
            </FormControl>
            <FormControl sx={{ m: 1 }} variant='filled'>
              <InputLabel htmlFor='filled-adornment-amount'>
                Employee cont.
              </InputLabel>
              <FilledInput
                id='filled-adornment-amount'
                style={{ width: '150px' }}
                startAdornment={
                  <InputAdornment position='start'>&#x20B9;</InputAdornment>
                }
                value={empContribution}
                onChange={(e) => setEmpContribution(e.target.value)}
                error={error}
              />
            </FormControl>
            <FormControl sx={{ m: 1 }} variant='filled'>
              <InputLabel htmlFor='filled-adornment-amount'>
                Employer cont.
              </InputLabel>
              <FilledInput
                id='filled-adornment-amount'
                style={{ width: '150px' }}
                startAdornment={
                  <InputAdornment position='start'>&#x20B9;</InputAdornment>
                }
                value={emplyrContribution}
                onChange={(e) => setEmplyrContribution(e.target.value)}
                error={error}
              />
            </FormControl>
            <Button
              onClick={insertNextRow}
              variant='contained'
              color='primary'
              style={{ width: 'fit-content', height: 'fit-content' }}
            >
              {' '}
              Add Next Month{' '}
            </Button>
          </div>
          <div
            className='ag-theme-alpine'
            style={{ height: '100%', width: '100%' }}
          >
            <AgGrid
              columnDefs={pfDepositColumnDefs}
              rowData={pfCtx.pfData.pfList}
              width={'100'}
              height={'100'}
            />
          </div>
          <div className={style.buttonContainer}>
            <Button color='success' variant='contained' onClick={savePf}>
              {' '}
              Save{' '}
            </Button>
            <Button color='error' variant='contained' onClick={clearPFEntry}>
              {' '}
              Cancel{' '}
            </Button>
          </div>
        </dialog>
      )}
    </>
  )
}

export const sortedData = (data) =>
  [...data].sort((a, b) => {
    const [monthA, yearA] = a.wageMonth.split('-')
    const [monthB, yearB] = b.wageMonth.split('-')
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
  })
export default PFInsertDialog
