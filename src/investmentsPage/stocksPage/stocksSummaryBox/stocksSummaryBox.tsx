import React from 'react'
import { useStocksContext } from '../../../contexts/stocksContext'
import style from './stocksSummaryBox.module.scss'
import CircleIcon from '@mui/icons-material/Circle'
interface StocksSummaryBoxProps {}

export const formattedCurrency = (amount: string | undefined) => {
  return parseFloat(amount || '0').toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  })
}
const StocksSummaryBox: React.FC<StocksSummaryBoxProps> = () => {
  const { stocksData } = useStocksContext()

  return (
    <div className={style.stocksSummaryBox}>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(stocksData.stocksSummary?.investedAmount)}
        </span>
        <span className={style.captionContainer}>Total Invested</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(stocksData.stocksSummary?.currentAmount)}
        </span>
        <span className={style.captionContainer}>Current Value</span>
      </div>
      <div className={style.infoContainer}>
        <span>{formattedCurrency(stocksData.stocksSummary?.change)}</span>
        <span className={style.captionContainer}>Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>{stocksData.stocksSummary?.percentChange}%</span>
        <span className={style.captionContainer}>% Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>{stocksData.stocksSummary?.securityCount}</span>
        <span className={style.captionContainer}>Securities Count</span>
      </div>
      <div className={style.infoContainer}>
        {stocksData.stocksSummary?.marketStatus ? (
          <CircleIcon color='success' />
        ) : (
          <CircleIcon color='error' />
        )}
        <span className={style.captionContainer}>Market Status</span>
      </div>
    </div>
  )
}

export default StocksSummaryBox
