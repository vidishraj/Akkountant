import React from 'react'
import { useStocksContext } from '../../../contexts/stocksContext'
import { formattedCurrency } from '../../stocksPage/stocksSummaryBox/stocksSummaryBox'
import style from './npsSummaryBox.module.scss'
import CircleIcon from '@mui/icons-material/Circle'
import { useNPSContext } from '../../../contexts/npsContext'
interface NPSSummaryBoxProps {}

const NPSSummaryBox: React.FC<NPSSummaryBoxProps> = () => {
  const { npsData } = useNPSContext()

  const { stocksData } = useStocksContext()
  return (
    <div className={style.stocksSummaryBox}>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(npsData.npsSummary?.investedAmount)}
        </span>
        <span className={style.captionContainer}>Total Invested</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(npsData.npsSummary?.currentAmount)}
        </span>
        <span className={style.captionContainer}>Current Value</span>
      </div>
      <div className={style.infoContainer}>
        <span>{formattedCurrency(npsData.npsSummary?.change)}</span>
        <span className={style.captionContainer}>Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>{npsData.npsSummary?.percentChange}%</span>
        <span className={style.captionContainer}>% Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>{npsData.npsSummary?.securityCount}</span>
        <span className={style.captionContainer}>Securities Count</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {stocksData.stocksSummary?.marketStatus ? (
            <CircleIcon color='success' />
          ) : (
            <CircleIcon color='error' />
          )}
        </span>
        <span className={style.captionContainer}>Market Status</span>
      </div>
    </div>
  )
}

export default NPSSummaryBox
