import React, { useState } from 'react'
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import { insertTrip } from '../api/travelAPI'
import { AxiosResponse } from 'axios'
import { useMessage } from '../contexts/messageContext'
import { useLoader } from '../contexts/loaderContext'
import { useTravel } from '../contexts/travelContext'

const TripPage = () => {
  const [trip, setTrip] = useState('')
  const [open, setOpen] = useState(false)
  const [tripTitle, setTripTitle] = useState('')
  const notif = useMessage()
  const loader = useLoader()
  const travelCtx = useTravel()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  function createTrip() {
    loader.setStatus((prev) => ({
      ...prev,
      travelPageStatus: true,
    }))
    insertTrip({ trip: tripTitle })
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          notif.setPayload({
            type: 'success',
            message: 'Successfully created trip.',
          })
        }
      })
      .catch((error) => {})
      .finally(() => {})
  }

  const handleTripChange = (event) => {
    setTrip(event.target.value)
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      minHeight='100vh'
      padding='16px'
      bgcolor='#f5f5f5'
    >
      <FormControl fullWidth variant='outlined' sx={{ marginBottom: '16px' }}>
        <InputLabel id='trip-select-label'>Choose Trip</InputLabel>
        <Select
          labelId='trip-select-label'
          id='trip-select'
          value={trip}
          onChange={handleTripChange}
          label='Choose Trip'
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          {travelCtx.state.trip?.map((item) => {
            return (
              <MenuItem
                key={item.tripId}
                onClick={() => {
                  travelCtx.dispatch({ type: 'SET_CHOSEN_TRIP', payload: item })
                }}
                value={item.tripId}
              >
                {item.tripTitle}
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>

      <Button
        variant='contained'
        fullWidth
        onClick={handleClickOpen}
        sx={{
          padding: isMobile ? '12px' : '16px',
          fontSize: isMobile ? '14px' : '16px',
          backgroundColor: '#1976d2',
          color: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        }}
      >
        Create Trip
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>Create New Trip</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            id='trip-title'
            label='Trip Title (min-3)'
            type='text'
            fullWidth
            variant='outlined'
            inputProps={{ maxLength: 150 }}
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
            sx={{
              marginTop: '16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={createTrip}
            disabled={tripTitle.length > 3 ? false : true}
            sx={{
              backgroundColor: tripTitle.length <= 3 ? 'grey' : '#1976d2',
              color: '#fff',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            Save Trip
          </Button>
          <Button onClick={handleClose} sx={{ color: theme.palette.grey[700] }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TripPage
