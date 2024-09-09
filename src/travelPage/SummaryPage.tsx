import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import InfiniteScrollContainer from './ExpenseContainer' // Assuming you have the InfiniteScrollContainer
import ExpenseDialog from './ExpenseDialog'
import { useTravel } from '../contexts/travelContext'
import { insertUser } from '../api/travelAPI'

interface ActionProps {
  refreshData: any
}
const ActionPage: React.FC<ActionProps> = (props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [expenseDialog, setExpenseDialog] = useState(false)
  // State to control dialog open/close
  const travelCtx = useTravel()
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setUsername('')
  }

  const handleSubmit = () => {
    // Handle the username submission logic here
    console.log('Username:', username)
    console.log('Username:', travelCtx.state.chosenTrip.tripId)
    const body = {
      user: [username, travelCtx.state.chosenTrip.tripId],
    }
    insertUser(body)
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        props.refreshData()
      })
    handleClose() // Close the dialog after submission
  }

  return (
    <Box
      id='parentBox'
      display='flex'
      flexDirection='column'
      height='90vh'
      paddingTop='50px' // Ensuring space for the header
      bgcolor='#f5f5f5'
    >
      {/* Labels Row */}
      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        justifyContent='space-around'
        padding='16px'
        bgcolor='#f5f5f5'
      >
        <Box display='flex' flexDirection='column' alignItems='center'>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{ color: '#1976d2' }}
          >
            {travelCtx?.state?.summary?.userCount !== undefined
              ? travelCtx.state.summary.userCount
              : 0}
          </Typography>
          <Typography
            variant={isMobile ? 'caption' : 'subtitle1'}
            sx={{ color: '#1976d2' }}
          >
            Total Users
          </Typography>
        </Box>

        <Box display='flex' flexDirection='column' alignItems='center'>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{ color: '#1976d2' }}
          >
            ₹ 5000
          </Typography>
          <Typography
            variant={isMobile ? 'caption' : 'subtitle1'}
            sx={{ color: '#1976d2' }}
          >
            Total Expenses
          </Typography>
        </Box>

        <Box display='flex' flexDirection='column' alignItems='center'>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{ color: '#1976d2' }}
          >
            1₹ = 0.42฿
          </Typography>
          <Typography
            variant={isMobile ? 'caption' : 'subtitle1'}
            sx={{ color: '#1976d2' }}
          >
            Exchange Rate
          </Typography>
        </Box>
      </Box>

      {/* Button Row */}
      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        justifyContent='space-around'
        padding='16px'
        bgcolor='#f5f5f5'
      >
        <Button
          variant='contained'
          sx={{
            padding: isMobile ? '6px' : '12px',
            fontSize: isMobile ? '10px' : '12px',
            backgroundColor: '#1976d2',
            color: '#fff',
            borderRadius: '8px',
            margin: isMobile ? '8px 0' : '0 8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
          onClick={handleOpen} // Open dialog on click
        >
          Users
        </Button>

        <Button
          variant='contained'
          sx={{
            padding: isMobile ? '6px' : '12px',
            fontSize: isMobile ? '10px' : '12px',
            backgroundColor: '#1976d2',
            color: '#fff',
            borderRadius: '8px',
            margin: isMobile ? '8px 0' : '0 8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
          onClick={() => setExpenseDialog(true)}
        >
          Add Expense
        </Button>

        <Button
          variant='contained'
          sx={{
            padding: isMobile ? '6px' : '12px',
            fontSize: isMobile ? '10px' : '12px',
            backgroundColor: '#1976d2',
            color: '#fff',
            borderRadius: '8px',
            margin: isMobile ? '8px 0' : '0 8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          See Balances
        </Button>
      </Box>

      {/* Infinite Scroll Container */}
      <Box
        id='outerBox'
        flexGrow={1}
        marginTop='24px'
        bgcolor='#ffffff'
        borderRadius='8px'
        boxShadow='0 2px 10px rgba(0, 0, 0, 0.1)'
        // padding='16px'
        display='flex'
        justifyContent='center'
        alignItems='center'
        sx={{
          height: 'calc(100vh - 290px)', // Adjust height based on total space
        }}
      >
        <InfiniteScrollContainer />

        <ExpenseDialog
          open={expenseDialog}
          onClose={() => {
            setExpenseDialog(false)
          }}
        ></ExpenseDialog>
      </Box>

      {/* Dialog for Adding Username */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Username (min 5)'
            type='text'
            fullWidth
            variant='outlined'
            inputProps={{ maxLength: 20 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ marginBottom: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmit}
            disabled={username?.length > 4 ? false : true}
            color='primary'
            variant='contained'
          >
            Submit
          </Button>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

const NameListDialog = ({ names, onClose }) => {
  return (
    <Dialog open onClose={onClose} fullWidth>
      <DialogTitle>Names List</DialogTitle>

      <DialogContent>
        <Box
          display='flex'
          flexDirection='column'
          padding='16px'
          bgcolor='#ffffff'
          borderRadius='8px'
        >
          {names.map((name, index) => (
            <Typography
              key={index}
              variant='body1'
              color='textPrimary'
              marginBottom={1}
            >
              {name}
            </Typography>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActionPage
