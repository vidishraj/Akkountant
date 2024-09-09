import React, { useState } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import './ExpenseContainer.scss'
import InfiniteScroll from 'react-infinite-scroll-component'
import ExpenseDialog from './ExpenseDialog'
const ExpenseItem = ({ expense }) => {
  const { date, expenseDesc, amount, paidBy, splitBetween } = expense

  return (
    <Card
      sx={{
        width: '100%',
        minWidth: 320,
        maxWidth: 400,
        margin: '8px 0',
        // padding: '16px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        bgcolor: '#f5f5f5', // Matches the theme background color
      }}
    >
      <CardContent>
        {/* Date */}
        <Typography
          variant='subtitle2'
          sx={{ color: '#1976d2', textAlign: 'right', marginBottom: '8px' }}
        >
          {date}
        </Typography>

        {/* Description */}
        <Typography
          variant='body2'
          sx={{
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333',
          }}
        >
          {expenseDesc}
        </Typography>

        {/* Divider */}
        <Divider sx={{ marginBottom: '8px' }} />

        {/* Amount */}
        <Typography
          variant='h6'
          sx={{ fontWeight: 'bold', color: '#1976d2', marginBottom: '8px' }}
        >
          ₹ {amount.toFixed(2)}
        </Typography>

        {/* Paid By */}
        <Typography variant='body2' sx={{ marginBottom: '8px', color: '#333' }}>
          <strong>Paid By:</strong> {paidBy}
        </Typography>

        {/* Split Between */}
        <Typography variant='body2' sx={{ color: '#333' }}>
          <strong>Split Between:</strong> {splitBetween.join(', ')}
        </Typography>
      </CardContent>
    </Card>
  )
}

const InfiniteScrollContainer = () => {
  const items = [
    {
      date: '11/05/2022',
      expenseDesc: 'Expense for hiring taxi to airport',
      amount: 254.51,
      paidBy: 'Vidish',
      splitBetween: ['Vidish', 'Chirra', 'Aish'],
    },
    {
      date: '12/05/2022',
      expenseDesc: 'Dinner at the hotel',
      amount: 350.75,
      paidBy: 'Chirra',
      splitBetween: ['Chirra', 'Vidish', 'Aish'],
    },
    // Add more items here if needed
  ]
  const [hasMore, setHasMore] = useState(true)

  const fetchMoreData = () => {
    // if (items.length >= 100) {
    //   setHasMore(false)
    //   return
    // }
    // // Simulate fetching more data
    // setTimeout(() => {
    //   setItems((prevItems) => prevItems.concat(Array.from({ length: 20 })))
    // }, 1500)
  }

  return (
    <Box
      id='innerBox'
      flexGrow={1}
      width='100%'
      bgcolor='#ffffff'
      borderRadius='8px'
      boxShadow='0 2px 10px rgba(0, 0, 0, 0.1)'
      padding='16px'
      display='flex'
      justifyContent='center'
      alignItems='center'
      sx={{
        height: '100%',
        overflow: 'auto', // Enable scrolling for the container
      }}
    >
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <Box display='flex' justifyContent='center' alignItems='center'>
            <CircularProgress />
          </Box>
        }
        endMessage={
          <Typography variant='body2' color='textSecondary' textAlign='center'>
            You have seen it all!
          </Typography>
        }
        height={'300px'}
        scrollableTarget={'parentBox'}
        style={{ width: '100%' }} // Ensuring full width for content
      >
        {items.map((_, index) => (
          <Box
            key={index}
            bgcolor='#f5f5f5'
            padding='16px'
            margin='8px 0'
            borderRadius='8px'
            boxShadow='0 2px 5px rgba(0, 0, 0, 0.1)'
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            <ExpenseItem expense={_}></ExpenseItem>
          </Box>
        ))}
      </InfiniteScroll>
    </Box>
  )
}

export default InfiniteScrollContainer
