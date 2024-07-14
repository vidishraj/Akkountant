import './liveTable.css'
import React, { useEffect, useState } from 'react'
import {
  fetchLiveTable,
  readEmails,
  updateCreditForLiveTable,
  updateLiveTag,
} from '../../api/transactionPageAPI'
import AgGrid from '../../commonComponents/agGridComponent/agGrid'
import {
  amountRenderer,
  bankRenderer,
  dateComparator,
  dateFormatter,
  filterParams,
} from '../transactionTable/agGridColumns/agGridColDefs'
import { useMessage } from '../../contexts/messageContext'
import RefreshIconBlack from '../../commonComponents/icons/refreshIconBlack'
import { useLoader } from '../../contexts/loaderContext'
import { ColDef, GridApi, GridOptions, MenuItemDef, NewValueParams } from 'ag-grid-community'
import DarkModeLoader from '../../commonComponents/basicLoader/basicLoader'
import SearchBar from '../../commonComponents/searchBar/searchBar'
import DateRangePicker from '../../commonComponents/dateRangePicker/dateRangePicker'
import Dropdown from '../../commonComponents/dropDown/dropDown'
import LiveTableLottie from '../../commonComponents/lottieAnimations/liveTableAnimation'
import SummaryBox from '../../commonComponents/summaryBox/summaryBox'
import GmailLottie from '../../commonComponents/lottieAnimations/gmailAnimation'
import MoneyReturnIcon from '../../commonComponents/icons/moneyReturnedIcon'
import { useGlobal } from '../../contexts/globalContext'

interface LiveTableProps {}
const LiveTable: React.FC<LiveTableProps> = (props) => {
  const {setAutoTagOpen, setDetails} = useGlobal()
  const [rowData, setRowData] = useState([])
  const { setPayload } = useMessage()
  const [dateList, setDateList] = useState([])
  const { status, setStatus } = useLoader()
  const LiveTableColumnDef: ColDef[] = [
    {
      headerName: 'Date',
      initialSort: 'desc',
      filter: 'agDateColumnFilter',
      filterParams: filterParams,
      field: 'date',
      cellRenderer: dateFormatter,
      minWidth: 120,
      maxWidth: 160,
      sortable: true,
      comparator: dateComparator,
      suppressMovable:true,
    },
    {
      headerName: 'Details',
      field: 'details',
      minWidth: 250,
      maxWidth: 450,
      suppressMovable:true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Amount',
      field: 'amount',
      minWidth: 170,
      suppressMovable:true,
      maxWidth: 180,
      sortable: true,
      cellRenderer: amountRenderer,
      comparator: (amount1, amount2) => {
        let amount1f = parseFloat(amount1)
        let amount2f = parseFloat(amount2)
        return amount1f - amount2f
      },
    },
    {
      headerName: 'Credit',
      field: 'credit',
      minWidth: 130,
      maxWidth: 160,
      sortable: true,
      suppressMovable:true,
      cellRenderer: moneyReturnRenderer,
      comparator: (amount1, amount2) => {
        let amount1f = parseFloat(amount1)
        let amount2f = parseFloat(amount2)
        return amount1f - amount2f
      },
      editable: true,
      singleClickEdit: true,
      onCellValueChanged: handleCreditChanged,
    },
    {
      headerName: 'Bank',
      field: 'bank',
      minWidth: 120,
      suppressMovable:true,
      cellRenderer: bankRenderer,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Tag',
      field: 'tag',
      suppressMovable:true,
      minWidth: 220,
      // maxWidth:35,
      editable: true,
      onCellValueChanged: updateTag,
      singleClickEdit: true,
      filter: 'agTextColumnFilter',
    },
  ]

  function moneyReturnRenderer(params) {
    if (params.data.credit !== null) {
      return (
        <>
          <MoneyReturnIcon width={20} height={20} />
          <span> Rs.{params.data.credit}</span>
        </>
      )
    } else {
      return <></>
    }
  }

  function handleCreditChanged(event: NewValueParams<any>) {
    let requestBody = {
      creditRelatedInfo: {
        newCredit: event.newValue !== '0' ? event.newValue : null,
        date: event.data.date,
        details: event.data.details,
        amount: event.data.amount,
      },
    }
    setStatus((prev) => ({
      ...prev,
      liveTableStatus: true,
    }))
    updateCreditForLiveTable(requestBody)
      .then((response) => {
        setPayload({ message: 'Updated credit successfully', type: 'success' })
      })
      .catch((error) => {
        setPayload({
          message: `Error while updating credit ${error.response.data.Error}`,
          type: 'error',
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          liveTableStatus: false,
        }))
      })
  }

  function updateTag(event: NewValueParams<any>) {
    let requestBody = {
      tagRelatedData: {
        newTag: event.newValue,
        date: event.data.date,
        details: event.data.details,
        amount: event.data.amount,
      },
    }
    setStatus((prev) => ({
      ...prev,
      liveTableStatus: true,
    }))
    updateLiveTag(requestBody)
      .then((response) => {
        setPayload({ message: 'Updated tag successfully..', type: 'success' })
      })
      .catch((error) => {
        setPayload({
          message: `Error while updating tag ${error.response.data.Error}`,
          type: 'error',
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          liveTableStatus: false,
        }))
      })
  }

  function updateLiveTable(userCalled: boolean) {
    setStatus((prev) => ({
      ...prev,
      liveTableStatus: true,
    }))
    return fetchLiveTable(userCalled)
      .then((response) => {
        if (response.cached === false) {
          setPayload({
            message: 'Fetched live transactions successfully.',
            type: 'success',
          })
        }
        let dateList = []
        response?.data?.Result?.forEach((item) => {
          dateList.push(item.date)
        })
        setDateList(getRangeOfDates(dateList))
        setRowData(response.data.Result)
      })
      .catch((error) => {
        setPayload({
          message: `Error while fetching live transaction ${error.response.data.Error}`,
          type: 'error',
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          liveTableStatus: false,
        }))
      })
  }

  useEffect(() => {
    setTimeout(() => {
      updateLiveTable(false)
    }, 1000)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleRefresh() {
    setStatus((prev) => ({
      ...prev,
      liveTableStatus: true,
    }))
    let formData = new FormData()
    if (
      filterModel.date.dateTo.split('/').length > 0 &&
      filterModel.date.dateTo.split('/').length > 0
    ) {
      const [year, month, day] = filterModel.date.dateTo.split('-').map(Number)
      const currentDate = new Date(year, month - 1, day) // Month is zero-indexed

      // Calculate the first date of the next month
      const nextMonthDate = new Date(currentDate)
      nextMonthDate.setMonth(currentDate.getMonth() + 1)
      nextMonthDate.setDate(1)

      // Format the result in "yyyy-mm-dd" format
      const formattedDate = `${nextMonthDate.getFullYear()}-${(
        nextMonthDate.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${nextMonthDate
        .getDate()
        .toString()
        .padStart(2, '0')}`
      formData.append('dateTo', formattedDate.replaceAll('-', '/'))
      formData.append(
        'dateFrom',
        filterModel.date.dateFrom.replaceAll('-', '/'),
      )
    }
    const startTime = performance.now();
    readEmails(formData)
      .then((response) => {
        let responseSum = 0
        let responseArray = response.data['`Transactions`']
        responseArray.forEach((element) => {
          responseSum += element
        })
        if (response.status === 200 && responseSum === responseArray.length) {
          setPayload({
            message: 'Updated transactions from email.',
            type: 'success',
          })
          updateLiveTable(true)
        } else {
          setPayload({
            message: `Error while reading transactions from email ${response}`,
            type: 'error',
          })
        }
      })
      .catch((error) => {
        if((performance.now()-startTime)/1000>=26){
          setPayload({
            message: `Reading email is taking a while. Please refresh after a few mins for updates.`,
            type: 'warning',
          })  
        }
        else{
          setPayload({
            message: `Error while reading transactions from email ${error.response.data.Error}`,
            type: 'error',
          })
        }
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          liveTableStatus: false,
        }))
      })
  }

  const [selectedMonth, setSelectedMonth] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [filterModel, setFilterModel] = useState({
    details: { filterType: 'text', type: 'contains', filter: '' },
    tag: { filterType: 'text', type: 'contains', filter: '' },
    date: { dateFrom: '', dateTo: '', filterType: 'date', type: 'inRange' },
    bank: { filterType: 'text', type: 'contains', filter: '' },
  })

  useEffect(() => {
    if(dateList.length===0){
      selectedMonthChanged(selectedMonth)
    }
    else{
      setSelectedMonth(dateList[0].label);
      selectedMonthChanged(dateList[0].label);
    }
  }, [selectedMonth, dateList])

  const [searchDropDownValue, setSearchDropDownValue] = useState('details')

  function searchDropDownChanged(event: any) {
    setSearchDropDownValue(event)
    setFilterModel((prev) => ({
      ...prev,
      tag: {
        ...prev.tag,
        filter: '',
      },
      details: {
        ...prev.details,
        filter: '',
      },
    }))
  }

  function searchValueChanged(event: any) {
    setFilterModel((prev) => ({
      ...prev,
      [searchDropDownValue]: {
        ...prev[searchDropDownValue],
        filter: event.target.value,
      },
    }))
  }

  const handleStartDateChange = (date: Date) => {
    if (date) {
      let start = date.toISOString().substring(0, 10)
      setFilterModel((prev) => ({
        ...prev,
        date: {
          ...prev.date,
          dateFrom: start,
        },
      }))
    } else {
      setFilterModel((prev) => ({
        ...prev,
        date: {
          ...prev.date,
          dateFrom: '',
          dateTo: '',
        },
      }))
    }
    setStartDate(date)
  }

  const handleEndDateChange = (date: any) => {
    if (date) {
      date.setDate(date.getDate() + 2)
      let endDate = date.toISOString().substring(0, 10)
      setFilterModel((prev) => ({
        ...prev,
        date: {
          ...prev.date,
          dateTo: endDate,
        },
      }))
    } else {
      setFilterModel((prev) => ({
        ...prev,
        date: {
          ...prev.date,
          dateFrom: '',
          dateTo: '',
        },
      }))
    }
    setEndDate(date)
  }

  const bankDropDownOptions = [
    { label: 'HDFC Credit', value: 'HDFC Credit' },
    { label: 'HDFC Debit', value: 'HDFC Debit' },
    { label: 'ICICI Amazon', value: 'ICICI' },
    { label: 'Yes Bank', value: 'YES' },
  ]

  function bankDropDownChanged(selectedVal) {
    setFilterModel((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        filter: selectedVal,
      },
    }))
  }
  const [totalDebits, setTotalDebits] = useState(0)
  const [totalCredit, setTotalCredits] = useState(0)

  function setSummaryData(rowData: GridApi<any>) {
    if (rowData) {
      let totalRows = rowData.getDisplayedRowCount()
      let totalCredits = 0
      let totalDebits = 0
      for (let i = 0; i < totalRows; i++) {
        totalDebits += parseFloat(rowData.getDisplayedRowAtIndex(i).data.amount)
        if (rowData.getDisplayedRowAtIndex(i).data.credit !== null) {
          totalCredits += parseFloat(
            rowData.getDisplayedRowAtIndex(i).data.credit,
          )
        }
      }
      setTotalCredits(totalCredits)
      setTotalDebits(totalDebits)
    }
  }

  function getRangeOfDates(dateStrings: any[]) {
    let dateMonths: Object = {}
    let dateMonthsList = []
    dateStrings.map((dateString) => {
      const [day, month, year] = dateString.split('/')
      const date = new Date(year, month - 1, day)
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(date)

      dateMonths[formattedDate] = true
      return formattedDate
    })
    let sortedDateMonths = Object.keys(dateMonths).sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateB.getTime() - dateA.getTime()
    })

    if (sortedDateMonths.length > 0) {
      setSelectedMonth(sortedDateMonths[0])
      const currentDate = new Date()
      const currentMonth = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(currentDate)
      if (sortedDateMonths[0] !== currentMonth.toString()) {
        sortedDateMonths.unshift(currentMonth.toString())
      }
    }

    sortedDateMonths?.forEach((item) => {
      dateMonthsList.push({ label: item, value: item })
    })
    return dateMonthsList
  }

  function selectedMonthChanged(selectedVal) {
    if (selectedVal !== '') {
      let [month, year] = selectedVal?.split(' ')
      let yearInt = parseInt(year)
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth()
      let firstDate = new Date(yearInt, monthIndex, 0).toLocaleDateString(
        'en-US',
        { year: 'numeric', month: '2-digit', day: '2-digit' },
      )
      let lastDate = new Date(yearInt, monthIndex + 1, 1).toLocaleDateString(
        'en-US',
        { year: 'numeric', month: '2-digit', day: '2-digit' },
      )

      let [month1, date1, year1] = firstDate.split('/')
      let [month2, date2, year2] = lastDate.split('/')
      setFilterModel((prev) => ({
        ...prev,
        date: {
          ...prev.date,
          dateFrom: `${year1}-${month1}-${date1}`,
          dateTo: `${year2}-${month2}-${date2}`,
        },
      }))
    }
  }

  function getCustomContextMenuItems(): (string | MenuItemDef)[] {
    return [
      {
        name: 'Add auto-tagging',
        action: ()=>{setAutoTagOpen(true)},
        icon: '<span class="ag-icon ag-icon-save" unselectable="on" role="presentation"></span>',
      },
    ];
  }
  const gridOptions: GridOptions = {
    onCellContextMenu(event) {
      setDetails(event.node.data.details)
    },
    suppressCopyRowsToClipboard: true,
    getContextMenuItems: getCustomContextMenuItems
  }
  return (
    <div
      style={{
        backgroundColor: 'whitesmoke',
        marginTop: '0',
        padding: '0',
        paddingTop: '50px',
      }}
    >
      <DarkModeLoader status={status.liveTableStatus}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <GmailLottie style={{ width: '10vw', height: '20vh' }} />
          <LiveTableLottie
            style={{ height: '20vh', width: '10vw', backgroundColor: '' }}
          />
        </div>
        <div className='liveTable'>
          <div className='searchContainer'>
            <SearchBar
              onDropDownChange={searchDropDownChanged}
              onInputChange={searchValueChanged}
            />
            <button
              onClick={() => handleRefresh()}
              className='refresh-button'
              disabled={status.liveTableStatus}
            >
              <RefreshIconBlack width={20} height={20} />
            </button>
          </div>
          <div className='liveTableWithFilters'>
            <AgGrid
              filterModel={filterModel}
              width={'80'}
              height={'100'}
              rowData={rowData}
              columnDefs={LiveTableColumnDef}
              onSummaryInfoReady={setSummaryData}
              gridOptions={gridOptions}
            />
            <div className='filterSummaryContainer'>
              <Dropdown
                options={dateList}
                className='dark-dropdown'
                onSelect={selectedMonthChanged}
              />
              <div className='filterContainer'>
                <Dropdown
                  options={bankDropDownOptions}
                  heading='All Banks'
                  className='dark-dropdown'
                  onSelect={bankDropDownChanged}
                />
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  handleEndDateChange={handleEndDateChange}
                  handleStartDateChange={handleStartDateChange}
                />
              </div>
              <SummaryBox
                totalDebited={totalDebits}
                totalCredited={totalCredit}
                className={'summaryBox'}
              />
            </div>
          </div>
        </div>
      </DarkModeLoader>
    </div>
  )
}

export default LiveTable
