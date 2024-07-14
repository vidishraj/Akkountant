import { motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { useStocksContext } from '../../../contexts/stocksContext'
import style from './stocksListBox.module.scss'
interface StocksListBoxProps {}

const StocksListBox: React.FC<StocksListBoxProps> = () => {
  const { stocksData, dispatch } = useStocksContext()
  function setSummaryData() {
    if (stocksData.stocksList) {
      let investedAmount = 0
      let currentAmount = 0
      let change = 0
      let percentChange = 0
      let securityCount = 0
      stocksData.stocksList.forEach((stock: any) => {
        investedAmount += stock.price * stock.quantity
        currentAmount += stock.currentPrice * stock.quantity
      })
      change = currentAmount - investedAmount
      securityCount = stocksData.stocksList.length
      percentChange = (change / investedAmount) * 100
      dispatch({
        type: 'UPDATE_STOCKS_SUMMARY',
        payload: {
          ...stocksData.stocksSummary,
          investedAmount: investedAmount.toFixed(2),
          currentAmount: currentAmount.toFixed(2),
          change: change.toFixed(2),
          percentChange: percentChange.toFixed(2),
          securityCount: securityCount,
        },
      })
    }
  }

  useEffect(() => {
    setSummaryData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stockSelected(index) {
    dispatch({
      type: 'UPDATE_STOCKS_INFO',
      payload: {
        ...stocksData.stocksList[index],
        purchased: true,
      },
    })
  }

  return (
    <div className={style.stocksListContainer}>
      {stocksData?.stocksList?.map((element: any, index) => {
        return (
          <StocksBox
            Name={element.stockName}
            CurrentPrice={element.currentPrice}
            change={element.change}
            percentChange={parseFloat(element.percentChange).toFixed(2)}
            onClickEvent={() => stockSelected(index)}
          />
        )
      })}
    </div>
  )
}

const StocksBox = ({
  Name,
  CurrentPrice,
  change,
  percentChange,
  onClickEvent,
}) => {
  return (
    <motion.div
      onClick={onClickEvent}
      className={style.stockBox}
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
    >
      <div className={style.stockName}>{Name}</div>
      <div
        className={style.trend}
        style={{ color: change > 0 ? '#4caf50' : 'red' }}
      >
        {change}
      </div>
      <div className={style.currentPrice}>{CurrentPrice}</div>
      <div
        className={style.otherDetails}
        style={{ color: change > 0 ? '#4caf50' : 'red' }}
      >
        {percentChange}%
      </div>
    </motion.div>
  )
}

export default StocksListBox
