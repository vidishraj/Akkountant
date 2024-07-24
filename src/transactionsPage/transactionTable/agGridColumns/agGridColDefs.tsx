import { ColDef } from 'ag-grid-community'
import '../transactionTable.css'
import BankIcon from '../../../commonComponents/icons/bankIcon'
import MoneyIcon from '../../../commonComponents/icons/moneyIcon'

function dateComparator2(date1, date2) {
  // Helper function to parse date strings
  const parseDate = dateStr => {
    const [day, month, year] = dateStr.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(`${fullYear}-${month}-${day}`);
  };

  // Parse the dates
  const dateObj1 = parseDate(date1);
  const dateObj2 = parseDate(date2);

  // Compare the dates
  if (dateObj1 < dateObj2) {
    return -1;
  } else if (dateObj1 > dateObj2) {
    return 1;
  } else {
    return 0;
  }
}


export function dateComparator(date1, date2) {
  let _date1 = date1.split('/')
  let _date2 = date2.split('/')
  var date1Number =
    date1 && new Date(`${_date1[2]}-${_date1[1]}-${_date1[0]}`).getTime()
  var date2Number =
    date2 && new Date(`${_date2[2]}-${_date2[1]}-${_date2[0]}`).getTime()

  if (_date1 && _date1.length === 1) {
    _date1 = date1.split('-')
    if (parseInt(_date1[1]) < 10) {
      _date1[1] = `0${_date1[1]}`
    }
    if (parseInt(_date1[2]) < 10) {
      _date1[2] = `0${_date1[2]}`
    }
    date1Number =
      date1 && new Date(`${_date1[0]}-${_date1[1]}-${_date1[2]}`).getTime()
  }

  if (_date2 && _date2.length === 1) {
    _date2 = date2.split('-')
    if (parseInt(_date2[1]) < 10) {
      _date2[1] = `0${_date2[1]}`
    }
    if (parseInt(_date2[2]) < 10) {
      _date2[2] = `0${_date2[2]}`
    }
    date2Number =
      date2 && new Date(`${_date2[0]}-${_date2[1]}-${_date2[2]}`).getTime()
  }
  if (isNaN(date1Number)) {
    date1Number = new Date(`${_date1[2]}-${_date1[1]}-${_date1[0]}`).getTime()
  }
  if (isNaN(date2Number)) {
    date2Number = new Date(`${_date2[2]}-${_date2[1]}-${_date2[0]}`).getTime()
  }

  if (date1Number === null && date2Number === null) {
    return 0
  }

  if (date1Number === null) {
    return -1
  } else if (date2Number === null) {
    return 1
  }

  return date1Number - date2Number
}

export function dateFormatter(params) {
  var dateAsString = params.data.date
  if (dateAsString == null) {
    dateAsString = params.data.uploadDate
  }
  var dateParts = dateAsString.split('/')
  if (dateParts && dateParts.length === 1) {
    dateParts = dateAsString.split('-')
    if (parseInt(dateParts[1]) < 10 && dateParts[1].length === 1) {
      dateParts[1] = `0${dateParts[1]}`
    }
    if (parseInt(dateParts[2]) < 10) {
      dateParts[2] = `0${dateParts[2]}`
    }
    let dateCheck = new Date(
      `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`,
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    if (dateCheck === 'Invalid Date') {
      return new Date(
        `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`,
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
    return dateCheck
  }
  return new Date(
    `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`,
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
export const parseDate = params => {
  var dateAsString = params.data.date
  const [day, month, year] = dateAsString.split('/');
  const fullYear = year.length === 2 ? `20${year}` : year;
  const date = new Date(`${fullYear}-${month}-${day}`);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function amountRenderer(params) {
  let amount: number = params.data.amount
  let amountString = Math.abs(amount).toString()

  if (amount < 0) {
    return (
      <div style={{}}>
        <MoneyIcon width={20} height={20} />
        <span
          style={{
            backgroundColor: '#0cca98',
            borderRadius: '10px',
            padding: '2px 11px',
            height: '',
            width: '80%',
          }}
          className='check'
        >
          {' '}
          {`Rs. ${amountString}`}
        </span>
      </div>
    )
  } else {
    return (
      <div>
        <MoneyIcon width={20} height={20} />
        <span
          style={{
            backgroundColor: '#E57373',
            borderRadius: '10px',
            padding: '2px 11px',
            width: '80%',
          }}
          className='check'
        >
          {' '}
          {`Rs. ${amountString}`}
        </span>
      </div>
    )
  }
}

export function setAmountStyle(params) {
  if (params.data.amount < 0) {
    return { backgroundColor: '#0cca98', textAlign: 'center' }
  }
  return { backgroundColor: '#E57373', textAlign: 'center' }
}

export var filterParams = {
  comparator: (filterLocalDateAtMidnight, cellValue) => {
    var dateAsString = cellValue
    if (dateAsString === null) {
      return -1
    }
    var dateParts = dateAsString.split('/')
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0]),
    )
    if (dateParts && dateParts.length === 1) {
      dateParts = dateAsString.split('-')
      if (parseInt(dateParts[1]) < 10) {
        dateParts[1] = `0${dateParts[1]}`
      }
      if (parseInt(dateParts[2]) < 10) {
        dateParts[2] = `0${dateParts[2]}`
      }
      cellDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2]),
      )
    }
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1
    }
    return 0
  },
  minValidYear: 2018,
  maxValidYear: 2025,
  inRangeFloatingFilterDateFormat: 'Do MMM YYYY',
}

export function bankRenderer(params) {
  function returnColour(value) {
    if (value === 'Bank of India') {
      return { background: '#f39c12' }
    }
    if (value === 'ICICI') {
      return { background: '#3498db', color: 'black', width: '40%' }
    }
    if (value === 'HDFC Debit') {
      return { background: ' #008080 ', color: 'white' }
    }
    if (value === 'HDFC Credit') {
      return { background: '#e74c3c  ', color: 'black' }
    }
    if (value === 'YES Bank') {
      return { background: '#222  ', color: 'white' }
    }
    if (value === 'YES Credit') {
      return { background: '#f1c9ff', color: 'black' }
    }
    if (value === 'YES Debit') {
      return { background: '#ffb735', color: 'white' }
    } else {
      return {}
    }
  }
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        <BankIcon style={{ alignSelf: 'center' }} width={30} height={30} />
        <span
          style={{
            borderRadius: '50px',
            padding: '0px 14px',
            alignSelf: 'center',
            height: 'fit-content',
            ...returnColour(params.data.bank),
          }}
        >
          {params.data.bank}
        </span>
      </div>
    </div>
  )
}

export function allBanksColDef(handleTagChanged: any): ColDef[] {
  return [
    {
      field: 'rowNo',
      hide: true,
    },
    {
      headerName: 'Date',
      initialSort: 'desc',
      filter: 'agDateColumnFilter',
      filterParams: filterParams,
      field: 'date',
      minWidth: 120,
      maxWidth: 130,
      cellRenderer: parseDate,
      sortable: true,
      comparator: dateComparator2,
    },
    {
      headerName: 'Details',
      field: 'details',
      minWidth: 250,
      maxWidth: 400,
      filter: 'agTextColumnFilter',
      cellStyle: { fontFamily: "'Lato', sans-serif" },
    },
    {
      headerName: 'Amount',
      field: 'amount',
      minWidth: 170,
      maxWidth: 180,
      sortable: true,
      comparator: (amount1, amount2) => {
        let amount1f = parseFloat(amount1)
        let amount2f = parseFloat(amount2)
        return amount1f - amount2f
      },
      cellRenderer: amountRenderer,
      // cellStyle: setAmountStyle
    },
    {
      headerName: 'Tag',
      field: 'tag',
      minWidth: 220,
      // maxWidth:280,
      editable: true,
      singleClickEdit: true,
      onCellValueChanged: (params) =>
        handleTagChanged(params.data.rowNo, params.newValue, params.data.bank),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Bank',
      field: 'bank',
      minWidth: 180,
      cellRenderer: bankRenderer,
      filter: 'agTextColumnFilter',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
  ]
}
