import React from 'react'
import style from './stocksPage.module.scss'
import stocksList from './nse-listed-stocks.json'
import {
  fetchStocks,
  fetchStocksTransactions,
  fetchStockWithCode,
  refreshStockPrices,
} from '../../api/investmentsAPI.tsx/stocksAPI'
import StocksListBox from './stocksListBox/stocksListBox'
import StocksSummaryBox from './stocksSummaryBox/stocksSummaryBox'
import StocksInfoBox from './stocksInfoBox/stocksInfoBox'
import { useStocksContext } from '../../contexts/stocksContext'
import RefreshIconBlack from '../../commonComponents/icons/refreshIconBlack'
import { useLoader } from '../../contexts/loaderContext'
import LoaderStocksAnimation from '../../commonComponents/lottieAnimations/loaderStocksAnimation'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { convertLastUpdatedDate } from '../mutualFundsPage/mutualFundsPage'

interface StocksPageProps {}

const StocksPage: React.FC<StocksPageProps> = () => {
  const { status, setStatus } = useLoader()
  const { stocksData, dispatch } = useStocksContext()
  function handleSuggestionClick(suggestion) {
    setStatus((prev) => ({
      ...prev,
      stockBoxStatus: true,
    }))
    let body = new FormData()
    body.append('stockCode', suggestion['symbol'])

    fetchStockWithCode(body)
      .then((response) => {
        dispatch({
          type: 'UPDATE_STOCKS_INFO',
          payload: response.data.Message,
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          stockBoxStatus: false,
        }))
      })
  }
  function handleRefresh() {
    setStatus((prev) => ({
      ...prev,
      stockBoxStatus: true,
    }))
    refreshStockPrices().then(() => {
      fetchStocks(true)
        .then((response) => {
          dispatch({
            type: 'UPDATE_STOCKS_LIST',
            payload: response.data.Message,
          })
          dispatch({
            type: 'UPDATE_STOCKS_INFO',
            payload: {},
          })
          fetchStocksTransactions()
            .then((response) => {
              dispatch({
                type: 'UPDATE_STOCKS_TRANSACTIONS',
                payload: response.data.Message,
              })
            })
            .finally(() => {
              setStatus((prev) => ({
                ...prev,
                stockBoxStatus: false,
              }))
            })
        })
        .catch(() => {
          setStatus((prev) => ({
            ...prev,
            stockBoxStatus: false,
          }))
        })
    })
  }
  const dataArray = Object.entries(stocksList).map(([name, symbol], index) => ({
    id: index + 1,
    name,
    symbol,
  }))

  const formatResult = (item) => {
    return (
      <>
        <span style={{ display: 'block', textAlign: 'left' }}>{item.name}</span>
      </>
    )
  }

  return (
    <div className={style.stocksPage}>
      {status.stockBoxStatus ? (
        <LoaderStocksAnimation style={{ height: '90vh', width: '100vw' }} />
      ) : (
        <>
          <div className={style.search}>
            <ReactSearchAutocomplete
              items={dataArray}
              className={style.searchBar}
              fuseOptions={{ keys: ['name', 'symbol'] }}
              resultStringKeyName='name'
              onSelect={handleSuggestionClick}
              formatResult={formatResult}
            />
            <div className={style.buttonContainer}>
              <button
                onClick={() => handleRefresh()}
                className={style.refreshButton}
                disabled={false}
              >
                <RefreshIconBlack width={20} height={20} />
              </button>
              <span className={style.lastUpdatedSpan}>
                {' '}
                {stocksData?.stocksList[0]?.['lastUpdated']
                  ? convertLastUpdatedDate(
                      stocksData?.stocksList[0]?.['lastUpdated'],
                    )
                  : ''}{' '}
              </span>
              <span className={style.lastUpdatedSpanUnder}> Last Updated</span>
            </div>
          </div>
          <div className={style.stockInfoContainer}>
            <div className={style.leftContainer}>
              <StocksListBox />
            </div>
            <div className={style.rightContainer}>
              <StocksSummaryBox />
              <StocksInfoBox refreshData={handleRefresh} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default StocksPage
