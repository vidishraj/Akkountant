import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './dateRangePicker.css'

interface DateRangePickerProps {
  startDate: any
  endDate: any
  handleStartDateChange: any
  handleEndDateChange: any
}

const DateRangePicker: React.FC<DateRangePickerProps> = (props) => {
  const { startDate, endDate, handleEndDateChange, handleStartDateChange } =
    props

  return (
    <div className='date-range-picker'>
      <DatePicker
        selected={startDate}
        onChange={handleStartDateChange}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        isClearable
        placeholderText='Start Date'
      />
      <DatePicker
        selected={endDate}
        onChange={handleEndDateChange}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        isClearable
        placeholderText='End Date'
      />
    </div>
  )
}

export default DateRangePicker
