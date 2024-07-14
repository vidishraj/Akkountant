import {
  Dialog,
  FormControl,
  DialogContent,
  TextField,
  InputAdornment,
  DialogActions,
} from '@mui/material'
import { Button } from '@mui/material'
import { useState } from 'react'
import style from './fdInsertDialog.module.scss'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useMessage } from '../../../contexts/messageContext'
import { fetchFD, insertFDDeposit } from '../../../api/investmentsAPI.tsx/fdAPI'
import { useFDContext } from '../../../contexts/fdContext'
import { useLoader } from '../../../contexts/loaderContext'

function FDInsertDialog({ handleClose, open }) {
  const [maturityDate, setMaturityDate] = useState<string>()
  const [investmentDate, handleDateChange] = useState<string>()
  const [investmentAmount, setInvestmentAmount] = useState<any>()
  const [maturityAmount, setMaturityAmount] = useState<any>()
  const [interestRate, setInterestRate] = useState<any>()
  const [bank, setBank] = useState<any>('')
  const [tenure, setTenure] = useState<any>()
  const { setPayload } = useMessage()
  const fdCtx = useFDContext()
  const { setStatus } = useLoader()
  function calculateMonthsBetweenDates(date1: string, date2: string): number {
    try {
      const [day1, month1, year1] = date1.split('/').map(Number)
      const [day2, month2, year2] = date2.split('/').map(Number)

      const firstDate = new Date(year1, month1 - 1, day1)
      const secondDate = new Date(year2, month2 - 1, day2)

      const months = (secondDate.getFullYear() - firstDate.getFullYear()) * 12
      const monthDifference = secondDate.getMonth() - firstDate.getMonth()

      return Math.abs(months + monthDifference)
    } catch {
      return 0
    }
  }
  function isValidAPIRequestBody(data: any) {
    const isValidDate = (dateString: string): boolean => {
      try {
        const [day, month, year] = dateString.split('/').map(Number)
        const parsedDate = new Date(year, month - 1, day)
        return (
          parsedDate.getDate() === day &&
          parsedDate.getMonth() + 1 === month &&
          parsedDate.getFullYear() === year
        )
      } catch {
        return false
      }
    }
    let duration = calculateMonthsBetweenDates(investmentDate, maturityDate)
    if (
      typeof data.investmentAmount === 'number' &&
      !isNaN(data.investmentAmount) &&
      typeof data.interestRate === 'number' &&
      !isNaN(data.interestRate) &&
      typeof duration === 'number' &&
      !isNaN(duration) &&
      typeof data.tenure === 'number' &&
      !isNaN(data.tenure) &&
      typeof data.bank === 'string' &&
      data.bank?.length > 0 &&
      typeof data.investmentDate === 'string' &&
      (typeof data.maturityAmount === 'string' ||
        typeof data.maturityAmount === 'number') &&
      /^\d{2}\/\d{2}\/\d{4}$/.test(data.investmentDate) &&
      isValidDate(data.investmentDate)
    ) {
      setStatus((prev) => ({
        ...prev,
        fdBoxStatus: true,
      }))

      // let [day, month, year ]= data.investmentDate.split('/');
      let body = {
        investmentAmount: investmentAmount,
        interestRate: interestRate,
        duration: duration,
        tenure: tenure,
        bank: bank,
        depositDate: data.investmentDate,
        maturityAmount: maturityAmount,
      }
      insertFDDeposit(body)
        .then(() => [
          fetchFD(true)
            .then((response) => {
              fdCtx.dispatch({
                type: 'UPDATE_FD',
                payload: response.data.Message,
              })
            })
            .finally(() => {
              setStatus((prev) => ({
                ...prev,
                fdBoxStatus: false,
              }))
            }),
        ])
        .catch((error) => {
          setPayload({
            type: 'error',
            message: `Error while inserting fd ${error}`,
          })
          setStatus((prev) => ({
            ...prev,
            fdBoxStatus: false,
          }))
        })
      handleClose()
    } else {
      setPayload({
        type: 'error',
        message: 'Fields are not filled properly',
      })
    }
  }

  function formatDateToString(dateString: any): string {
    let date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear())
    return `${day}/${month}/${year}`
  }
  return (
    <div>
      <Dialog open={open} onClose={handleClose} className={style.mainDialog}>
        <DialogContent className={style.goldInputDialog}>
          <FormControl sx={{ m: 1 }} variant='filled'>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label='Investment Date'
                sx={{}}
                value={investmentDate ? new Date(investmentDate) : null}
                // minDate={new Date('2000-01-01')} // Set minimum selectable date if needed
                // maxDate={new Date().getUTCDate  } // Set minimum selectable date if needed
                onChange={(e) => handleDateChange(formatDateToString(e))}
              />
            </LocalizationProvider>
          </FormControl>
          <FormControl sx={{ m: 1 }} variant='filled'>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label='Maturity Date'
                sx={{}}
                value={maturityDate ? new Date(maturityDate) : null}
                // minDate={new Date('2000-01-01')} // Set minimum selectable date if needed
                // maxDate={new Date().getUTCDate  } // Set minimum selectable date if needed
                onChange={(e) => setMaturityDate(formatDateToString(e))}
              />
            </LocalizationProvider>
          </FormControl>
          <TextField
            label='Invested Amount'
            type={'number'}
            id='outlined-start-adornment'
            sx={{ m: 1 }}
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(parseFloat(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position='end'>&#x20B9;</InputAdornment>
              ),
            }}
          />
          <TextField
            label='Maturity Amount'
            type={'number'}
            id='outlined-start-adornment'
            value={maturityAmount}
            onChange={(e) => setMaturityAmount(parseFloat(e.target.value))}
            sx={{ m: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='end'>&#x20B9;</InputAdornment>
              ),
            }}
          />
          <TextField
            label='Interest Rate'
            type={'number'}
            id='outlined-end-adornment'
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            sx={{ m: 1 }}
            InputProps={{
              endAdornment: <InputAdornment position='end'>%</InputAdornment>,
            }}
          />
          <TextField
            label='Bank'
            id='outlined-start-adornment'
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            sx={{ m: 1 }}
          />
          <TextField
            label='Tenure'
            type={'number'}
            id='outlined-start-adornment'
            value={tenure}
            onChange={(e) => setTenure(parseFloat(e.target.value))}
            sx={{ m: 1 }}
          />
        </DialogContent>
        <DialogActions
          className={style.buttonContainer}
          style={{
            display: 'flex',
            backgroundColor: '',
            justifyContent: 'space-evenly',
          }}
        >
          <Button
            color='success'
            variant='outlined'
            onClick={() =>
              isValidAPIRequestBody({
                investmentDate,
                maturityDate,
                investmentAmount,
                maturityAmount,
                interestRate,
                bank,
                tenure,
              })
            }
          >
            Submit
          </Button>
          <Button color='error' variant='outlined' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default FDInsertDialog
