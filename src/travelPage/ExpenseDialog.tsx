import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Box,
} from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import { useEffect } from 'react'
import {
  Typography,
  FormControlLabel,
  Checkbox,
  Switch,
  Divider,
} from '@mui/material'
import { useTravel } from '../contexts/travelContext'

const UserAmountDialog = ({ amount, onSubmit, onCancel, open }) => {
  const travelCtx = useTravel()
  const users = travelCtx.state.users
  console.log(users, amount, open)
  const [checkedUsers, setCheckedUsers] = useState(
    users.map((user) => ({
      ...user,
      isChecked: true,
      amount: amount / users.length,
    })),
  )
  const [isEqual, setIsEqual] = useState(true)
  const [totalAmount, setTotalAmount] = useState(amount)

  // Handle equal toggle change
  const handleEqualToggle = () => {
    setIsEqual((prev) => !prev)
    if (isEqual) {
      const checkedCount = checkedUsers.filter((user) => user.isChecked).length
      checkedUsers.forEach((user) => {
        user.amount = user.isChecked ? amount / checkedCount : 0
      })
    }
  }

  // Update amounts when equal toggle is selected
  useEffect(() => {
    if (isEqual) {
      const checkedCount = checkedUsers.filter((user) => user.isChecked).length
      setCheckedUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          amount: user.isChecked ? amount / checkedCount : 0,
        })),
      )
    }
  }, [])

  // Handle checkbox change
  const handleCheckboxChange = (index) => {
    setCheckedUsers((prevUsers) => {
      const newUsers = [...prevUsers]
      newUsers[index].isChecked = !newUsers[index].isChecked

      // Recalculate the amounts for equal division if toggle is enabled
      if (isEqual) {
        const checkedCount = newUsers.filter((user) => user.isChecked).length
        newUsers.forEach((user) => {
          user.amount = user.isChecked ? amount / checkedCount : 0
        })
      }

      return newUsers
    })
  }

  // Handle amount change for custom input
  const handleAmountChange = (index, newValue) => {
    setCheckedUsers((prevUsers) => {
      const newUsers = [...prevUsers]
      newUsers[index].amount = newValue
      return newUsers
    })
  }

  // Validate if total custom amount matches the given amount
  useEffect(() => {
    const sum = checkedUsers.reduce(
      (acc, user) => (user.isChecked ? acc + Number(user.amount) : acc),
      0,
    )
    setTotalAmount(sum)
  }, [checkedUsers])

  // Enable submit only if total custom amount matches the prop amount or equal toggle is on
  const isSubmitDisabled = !isEqual && totalAmount !== amount

  return (
    <Dialog open={open} onClose={onCancel} fullWidth>
      <DialogTitle>Distribute Amount</DialogTitle>

      <DialogContent>
        {/* Equal Toggle */}
        <FormControlLabel
          control={<Switch checked={isEqual} onChange={handleEqualToggle} />}
          label='Equal'
        />

        <Divider sx={{ marginY: 2 }} />

        {/* User list with checkboxes and input fields */}
        {checkedUsers.map((user, index) => (
          <Box
            key={user.userId}
            display='flex'
            alignItems='center'
            marginBottom={2}
          >
            {/* Checkbox for user */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.isChecked}
                  onChange={() => handleCheckboxChange(index)}
                />
              }
              label={user.userName}
              sx={{ flex: 1 }}
            />

            {/* Number input field */}
            <TextField
              type='number'
              variant='outlined'
              size='small'
              value={user.amount}
              onChange={(e) =>
                !isEqual && handleAmountChange(index, Number(e.target.value))
              }
              disabled={isEqual || !user.isChecked} // Disable input when equal toggle is on or user is unchecked
              inputProps={{ min: 0 }}
              sx={{ width: '120px' }}
            />
          </Box>
        ))}

        {/* Total amount validation message for custom input */}
        {!isEqual && totalAmount !== amount && (
          <>
            <Typography color='error' variant='caption'>
              The total amount should equal ₹{amount.toFixed(2)}
            </Typography>
            <Typography color='error' variant='caption'>
              Remaining ₹{(amount - totalAmount).toFixed(2)}
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color='secondary'>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(checkedUsers)}
          color='primary'
          variant='contained'
          disabled={isSubmitDisabled}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ExpenseDialog = ({ open, onClose }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const travelCtx = useTravel()

  const [date, setDate] = useState(new Date().toISOString().substr(0, 10))
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [amountInBaht, setAmountInBaht] = useState(0)
  const [paidBy, setPaidBy] = useState<any>('')
  const [amountSetter, openAmountSetter] = useState(false)

  const [useINR, setUseINR] = useState(true)
  const [useTHB, setUseTHB] = useState(false)
  const [isSplitEnabled, setIsSplitEnabled] = useState(false)
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false)

  const conversionRate = 0.41 // Example conversion rate (adjust as needed)

  const handleINRChange = (value) => {
    setTotalAmount(value)
    setAmountInBaht(value * conversionRate)
  }

  const handleTHBChange = (value) => {
    setAmountInBaht(value)
    setTotalAmount(value / conversionRate)
  }

  // Handle checkbox toggle for INR
  const handleINRCheckboxChange = (event) => {
    setUseINR(event.target.checked)
    setUseTHB(!event.target.checked)
  }

  // Handle checkbox toggle for THB
  const handleTHBCheckboxChange = (event) => {
    setUseTHB(event.target.checked)
    setUseINR(!event.target.checked)
  }

  // Enable split button when amounts and paidBy field are filled
  useEffect(() => {
    if ((useINR && totalAmount > 0) || (useTHB && amountInBaht > 0)) {
      setIsSplitEnabled(!!paidBy)
    } else {
      setIsSplitEnabled(false)
    }
  }, [totalAmount, amountInBaht, paidBy, useINR, useTHB])

  // Enable submit button when all fields are filled
  useEffect(() => {
    const isFormComplete =
      date &&
      description &&
      ((useINR && totalAmount > 0) || (useTHB && amountInBaht > 0)) &&
      paidBy
    setIsSubmitEnabled(isFormComplete)
  }, [date, description, totalAmount, amountInBaht, paidBy, useINR, useTHB])

  const handleSubmit = () => {
    // Handle submit logic here
    onClose()
  }

  const handleSplitBetween = () => {
    openAmountSetter(true)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Add Expense</DialogTitle>
      <DialogContent>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          padding='16px'
          bgcolor='#f5f5f5'
        >
          {/* Date Picker */}
          <TextField
            label='Date'
            type='date'
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              marginBottom: '16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          />

          {/* Description */}
          <TextField
            label='Description'
            fullWidth
            variant='outlined'
            inputProps={{ maxLength: 250 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              marginBottom: '16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          />

          {/* INR Amount with checkbox */}
          <Box
            display='flex'
            alignItems='center'
            sx={{ marginBottom: '16px', width: '100%' }}
          >
            <FormControlLabel
              control={
                <Checkbox checked={useINR} onChange={handleINRCheckboxChange} />
              }
              label=''
            />
            <TextField
              label='Total Amount (INR)'
              type='number'
              fullWidth
              value={totalAmount}
              onChange={(e) => handleINRChange(parseFloat(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>₹</InputAdornment>
                ),
              }}
              disabled={!useINR}
              sx={{
                marginLeft: '16px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            />
          </Box>

          {/* THB Amount with checkbox */}
          <Box
            display='flex'
            alignItems='center'
            sx={{ marginBottom: '16px', width: '100%' }}
          >
            <FormControlLabel
              control={
                <Checkbox checked={useTHB} onChange={handleTHBCheckboxChange} />
              }
              label=''
            />
            <TextField
              label='Amount (THB)'
              type='number'
              fullWidth
              value={amountInBaht}
              onChange={(e) => handleTHBChange(parseFloat(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>฿</InputAdornment>
                ),
              }}
              disabled={!useTHB}
              sx={{
                marginLeft: '16px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            />
          </Box>

          {/* Paid By Dropdown */}
          <TextField
            label='Paid By'
            select
            fullWidth
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            sx={{
              marginBottom: '16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            {travelCtx.state.users.map((item) => {
              return (
                <MenuItem key={item.userId} value={item.userId}>
                  {item.userName}
                </MenuItem>
              )
            })}
          </TextField>

          {/* Split Between Button */}
          <Button
            variant='outlined'
            fullWidth
            onClick={handleSplitBetween}
            disabled={!isSplitEnabled}
            sx={{
              marginBottom: '16px',
              padding: isMobile ? '10px' : '12px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              borderColor: '#1976d2',
              color: '#1976d2',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            Split Between
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: theme.palette.grey[700] }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#1976d2',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
          disabled={!isSubmitEnabled}
        >
          Submit
        </Button>
      </DialogActions>
      {travelCtx.state.users && (
        <UserAmountDialog
          amount={totalAmount}
          onSubmit={() => {}}
          onCancel={() => openAmountSetter(false)}
          open={amountSetter}
        />
      )}
    </Dialog>
  )
}

export default ExpenseDialog
