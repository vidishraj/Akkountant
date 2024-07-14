import React, { useEffect, useState, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import style from './ppfDialogs.module.scss'
import { useLoader } from '../../../contexts/loaderContext'
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  OutlinedInput,
} from '@mui/material'
import { insertPPF } from '../../../api/investmentsAPI.tsx/ppfAPI'

const PPFDepositInsert = ({ display, setDisplay }) => {
  const dialogRef = useRef(null)
  const { setStatus } = useLoader()
  const boxRef = useRef<any>()
  const [selectedDate, handleDateChange] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (display) {
      const favDialog: any = document.getElementById('favDialog')
      favDialog.showModal()
    }
  }, [display])

  function onSubmitHandler(e, date, amount) {
    setStatus((prev) => ({
      ...prev,
      ppfBoxStatus: false,
    }))

    let body = {
      depositDate: selectedDate,
      depositAmount: amount,
    }
    insertPPF(body).finally(() => {
      setStatus((prev) => ({
        ...prev,
        ppfBoxStatus: false,
      }))
    })
  }

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
          <div>
            <Box className={style.customModal} ref={boxRef}>
              <TextField
                type='date'
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              <OutlinedInput
                id=''
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                startAdornment={
                  <InputAdornment position='end'>&#x20B9;</InputAdornment>
                }
                label='Amount'
              />
              <Button
                variant='contained'
                onClick={(e) => onSubmitHandler(e, selectedDate, amount)}
              >
                Submit
              </Button>
            </Box>
          </div>
        </dialog>
      )}
    </>
  )
}

export default PPFDepositInsert
