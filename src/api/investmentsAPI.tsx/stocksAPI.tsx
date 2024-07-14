import axios from '../../commonComponents/interceptor/interceptor'

export interface StockResponse {
  stockName: string
  currentPrice: number
  industry: string
  dayBuyQuant: number
  dayClose: number
  dayHigh: number
  dayLow: number
  dayOpen: number
  daySellQuant: number
  percentChange: number
  prevClose: number
  symbol: string
  valueChange: number
  volume: number
  purchased?: boolean
  quantity?: number
  price?: any
}

export async function fetchStocks(userCalled: boolean): Promise<any> {
  let cacheInstace = {}
  if (userCalled) {
    axios.storage.remove('fetch-stocks')
  }
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchStocks', {
      id: 'fetch-stocks',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function fetchStocksTransactions(): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-stocks-transactions')
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchStocksTransactions', {
      id: 'fetch-stocks-transactions',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
export async function fetchStockWithCode(code): Promise<any> {
  let cacheInstace = {}
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/fetchStockPriceWithCode', code, {
      id: 'fetch-stock-with-code',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function insertStock(body): Promise<any> {
  axios.storage.remove('fetch-stocks')
  axios.storage.remove('fetch-stocks-transactions')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/insertStock', body)
    .then((response) => {
      return response
    })
}

export async function addStock(body): Promise<any> {
  axios.storage.remove('fetch-stocks')
  axios.storage.remove('fetch-stocks-transactions')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/addStock', body)
    .then((response) => {
      return response
    })
}

export async function sellStock(body): Promise<any> {
  axios.storage.remove('fetch-stocks')
  axios.storage.remove('fetch-stocks-transactions')
  return await axios
    .post(process.env.REACT_APP_BACKENDURL + '/sellStock', body)
    .then((response) => {
      return response
    })
}

export async function refreshStockPrices(): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-stocks')
  axios.storage.remove('fetch-stocks-transactions')
  axios.storage.remove('refresh-stocks')
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/refreshStockPrices', {
      id: 'refresh-stocks',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}

export async function fetchMarketStatus(): Promise<any> {
  let cacheInstace = {}
  axios.storage.remove('fetch-stocks')
  axios.storage.remove('refresh-stocks')
  return await axios
    .get(process.env.REACT_APP_BACKENDURL + '/fetchMarketStatus', {
      id: 'market-status',
      cache: cacheInstace,
    })
    .then((response) => {
      return response
    })
}
