import React, { useEffect, useState } from 'react'
import Dropdown from '../../commonComponents/dropDown/dropDown'
import { allBanksData, updateTag } from '../../api/transactionPageAPI'
import { allBanksColDef } from './agGridColumns/agGridColDefs'
import { ColDef, GridApi, GridOptions, MenuItemDef } from 'ag-grid-community'
import AgGrid from '../../commonComponents/agGridComponent/agGrid'
import './transactionTable.css'
import { useMessage } from '../../contexts/messageContext'
import RefreshIconBlack from '../../commonComponents/icons/refreshIconBlack'
import { useLoader } from '../../contexts/loaderContext'
import DateRangePicker from '../../commonComponents/dateRangePicker/dateRangePicker'
import DarkModeLoader from '../../commonComponents/basicLoader/basicLoader'
import SearchBar from '../../commonComponents/searchBar/searchBar'
import TransactionTableAnimation from '../../commonComponents/lottieAnimations/transactionTableAnimation'
import SummaryBox from '../../commonComponents/summaryBox/summaryBox'
import { useGlobal } from '../../contexts/globalContext'

interface TransactionTableProps {}

const TransactionsTable: React.FC<TransactionTableProps> = (props) => {
  // eslint-disable-next-line
  const [colDef, setColDef] = useState<ColDef[]>()
  const [tableData, setTableData] = useState<Array<any>>()
  const [completeData, setCompleteData] = useState<Array<any>>()
  const [ICICIData, setICICIData] = useState<Array<any>>()
  const [BOIData, setBOIData] = useState<Array<any>>()
  const [HDFCCreditData, setHDFCCredit] = useState<Array<any>>()
  const [HDFCDebitData, setHDFCDebit] = useState<Array<any>>()

  const allCol: ColDef[] = allBanksColDef(handlerTagChanged)

  const { setPayload } = useMessage()
  const {setAutoTagOpen, setDetails} = useGlobal()
  const { status, setStatus } = useLoader()
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [searchDropDownValue, setSearchDropDownValue] = useState('details')

  function setDataToFormat(response) {
    setBOIData(response.BOI)
    setICICIData(response.ICICI)
    setHDFCCredit(response.HDFC_Credit)
    setHDFCDebit(response.HDFC_Debit)

    let allData = []
    response.BOI.map((element, index) => {
      allData.push({
        rowNo: index,
        date: element.date,
        details: element.details,
        amount: element.amount,
        tag: element.tag,
        bank: 'Bank of India',
      })
      return null
    })

    response.ICICI.map((element, index) => {
      allData.push({
        rowNo: index,
        date: element.date,
        details: element.details,
        amount: element.amount,
        tag: element.tag,
        bank: 'ICICI',
      })

      return null
    })

    response.HDFC_Credit.map((element, index) => {
      allData.push({
        rowNo: index,
        date: element.date,
        details: element.details,
        amount: element.amount,
        tag: element.tag,
        bank: 'HDFC Credit',
      })
      return null
    })

    response.YES_Credit.map((element, index) => {
      allData.push({
        rowNo: index,
        date: element.date,
        details: element.details,
        amount: element.amount,
        tag: element.tag,
        bank: 'YES Credit',
      })
      return null
    })

    response.HDFC_Debit.map((element, index) => {
      allData.push({
        rowNo: index,
        date: element.date,
        details: element.details,
        amount: element.amount,
        tag: element.tag,
        bank: 'HDFC Debit',
      })
      return null
    })
    
    response.YES_Debit.map((element, index) => {
      allData.push({
        rowNo: index,
        date: element.date,
        details: element.details,
        amount: element.amount,
        tag: element.tag,
        bank: 'YES Debit',
      })
      return null
    })

    setCompleteData(allData)
  }

  function refreshData(userCalled) {
    setStatus((prev) => ({
      ...prev,
      mainTransactionStatus: true,
    }))
    allBanksData(userCalled)
      .then((response) => {
        if (response.cached === false) {
          setPayload((prev) => ({
            ...prev,
            message: 'All transactions loaded successfully.',
            type: 'success',
          }))
        }
        setDataToFormat(response.data.Transactions)
      })
      .catch((error) => {
        setPayload({
          message: `Error while fetching transactions. ${error.response.data.Error}`,
          type: 'error',
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          mainTransactionStatus: false,
        }))
      })
  }

  useEffect(() => {
    refreshData(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (completeData) {
      setData('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completeData])

  function setData(selectedValue) {
    switch (selectedValue) {
      case '':
        setColDef(allCol)
        setTableData(completeData)
        break

      default:
        setColDef(allCol)
        setTableData(completeData)
        break
    }
  }

  function handlerTagChanged(rowNo, newTag, bankType) {
    let requestData = {}
    setStatus((prev) => ({
      ...prev,
      mainTransactionStatus: true,
    }))

    switch (bankType) {
      case 'ICICI':
        requestData['bank'] = 'ICICI'
        requestData['tagRelatedData'] = {}
        requestData['tagRelatedData']['newTag'] = newTag
        requestData['tagRelatedData']['reference'] = ICICIData[rowNo].reference
        break
      case 'HDFC Debit':
        requestData['bank'] = 'HDFC_Debit'
        requestData['tagRelatedData'] = {}
        requestData['tagRelatedData']['newTag'] = newTag
        requestData['tagRelatedData']['reference'] =
          HDFCDebitData[rowNo].reference
        break
      case 'HDFC Credit':
        requestData['bank'] = 'HDFC_Credit'
        requestData['tagRelatedData'] = {}
        requestData['tagRelatedData']['newTag'] = newTag
        requestData['tagRelatedData']['date'] = HDFCCreditData[rowNo].date
        requestData['tagRelatedData']['details'] = HDFCCreditData[rowNo].details
        requestData['tagRelatedData']['amount'] = HDFCCreditData[rowNo].amount

        break
      case 'Bank of India':
        requestData['bank'] = 'BOI'
        requestData['tagRelatedData'] = {}
        requestData['tagRelatedData']['newTag'] = newTag
        requestData['tagRelatedData']['date'] = BOIData[rowNo].date
        requestData['tagRelatedData']['details'] = BOIData[rowNo].details
        requestData['tagRelatedData']['amount'] = BOIData[rowNo].amount
        requestData['tagRelatedData']['balance'] = BOIData[rowNo].balance
        break

      default:
        return
    }
    updateTag(requestData)
      .then((response) => {
        setPayload((prev) => ({
          ...prev,
          message: 'Tag updated successfully.',
          type: 'success',
        }))
      })
      .catch((error) => {
        setPayload({
          message: `Error updating tag. ${error.response.data.Error}`,
          type: 'error',
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          mainTransactionStatus: false,
        }))
      })
  }

  const bankDropDownOptions = [
    { label: 'HDFC Credit', value: 'HDFC Credit' },
    { label: 'HDFC Debit', value: 'HDFC Debit' },
    { label: 'Bank of India', value: 'Bank of India' },
    { label: 'ICICI Amazon', value: 'ICICI' },
    { label: 'YES Debit', value: 'YES Debit' },
    { label: 'YES Credit', value: 'YES Credit' },
  ]

  const [filterModel, setFilterModel] = useState({
    details: { filterType: 'text', type: 'contains', filter: '' },
    tag: { filterType: 'text', type: 'contains', filter: '' },
    date: { dateFrom: '', dateTo: '', filterType: 'date', type: 'inRange' },
    bank: { filterType: 'text', type: 'contains', filter: '' },
  })

  function bankDropDownChanged(selectedVal) {
    setFilterModel((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        filter: selectedVal,
      },
    }))
  }

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
      let newDate = new Date(date)
      newDate.setDate(newDate.getDate() - 2)
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

  const handleEndDateChange = (date: Date) => {
    if (date) {
      let newDate = new Date(date)
      newDate.setDate(newDate.getDate() + 2)
      let endDate = newDate.toISOString().substring(0, 10)
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

  const [totalDebits, setTotalDebits] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)

  function setSummaryData(rowData: GridApi<any>) {
    if (rowData) {
      let totalRows = rowData.getDisplayedRowCount()
      let totalCredits = 0
      let totalDebits = 0
      for (let i = 0; i < totalRows; i++) {
        let currentAmount = parseFloat(
          rowData.getDisplayedRowAtIndex(i).data.amount,
        )
        currentAmount < 0
          ? (totalCredits += currentAmount)
          : (totalDebits += currentAmount)
      }
      totalCredits = -1 * totalCredits
      setTotalCredits(totalCredits)
      setTotalDebits(totalDebits)
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
      className='transactionsTableWrapper'
      style={{ marginTop: '0', padding: '0' }}
    >
      <DarkModeLoader status={status.mainTransactionStatus}>
        <div>
          <TransactionTableAnimation style={{ height: '20vh' }} />
        </div>
        <div className='transactionsTable'>
          <div className='searchContainer'>
            <SearchBar
              onDropDownChange={searchDropDownChanged}
              onInputChange={searchValueChanged}
            />
            <button
              onClick={() => refreshData(true)}
              className='refresh-button'
              disabled={status.mainTransactionStatus}
            >
              <RefreshIconBlack width={20} height={20} />
            </button>
          </div>
          <div className='tableWithFilters '>
            <AgGrid
              filterModel={filterModel}
              width={'80'}
              height={'100'}
              rowData={tableData}
              columnDefs={colDef}
              onSummaryInfoReady={setSummaryData}
              gridOptions={gridOptions}
            />

            <div className='filterSummaryContainer'>
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
                totalCredited={totalCredits}
                className={'summaryBox'}
              />
            </div>
          </div>
        </div>
      </DarkModeLoader>
    </div>
  )
}

export default TransactionsTable
