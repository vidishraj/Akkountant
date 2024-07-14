import {
  Button,
  Dialog,
  DialogContent,
  TextField,
  OutlinedInput,
  InputAdornment,
  MenuItem,
  DialogActions,
} from '@mui/material'
import { useState } from 'react'
import style from '../goldPage.module.scss'

export function FormDialog({ handleSubmit, handleClose, open }) {
  const goldTypes = [
    {
      value: '18K',
      label: '18K',
    },
    {
      value: '22K',
      label: '22K',
    },
    {
      value: '24K',
      label: '24K',
    },
  ]

  const [selectedDate, handleDateChange] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [weight, handleWeight] = useState('')
  const [goldType, setGoldType] = useState('')

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={'lg'}
        className={style.mainDialog}
      >
        <DialogContent className={style.goldInputDialog}>
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
          <OutlinedInput
            id=''
            value={weight}
            onChange={(e) => handleWeight(e.target.value)}
            endAdornment={<InputAdornment position='end'>g</InputAdornment>}
            label='Weight'
          />
          <TextField
            id='outlined-multiline-flexible'
            multiline
            label='Description'
            maxRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            id='outlined-select-currency'
            select
            label='Select Gold Type'
            value={goldType}
            onChange={(e) => setGoldType(e.target.value)}
          >
            {goldTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions
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
              handleSubmit(selectedDate, description, goldType, amount, weight)
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
