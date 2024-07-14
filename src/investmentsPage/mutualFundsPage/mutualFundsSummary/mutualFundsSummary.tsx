import React from 'react'
import { useMutualFundsContext } from '../../../contexts/mutualFundsContext'
import { useStocksContext } from '../../../contexts/stocksContext'
import { formattedCurrency } from '../../stocksPage/stocksSummaryBox/stocksSummaryBox'
import style from './mutualFundsSummary.module.scss'
import CircleIcon from '@mui/icons-material/Circle'
interface MutualFundsSummaryBoxProps {}

const MutualFundsSummaryBox: React.FC<MutualFundsSummaryBoxProps> = () => {
  const { mutualFundsData } = useMutualFundsContext()
  const { stocksData } = useStocksContext()
  return (
    <div className={style.stocksSummaryBox}>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(mutualFundsData.mfSummary?.investedAmount)}
        </span>
        <span className={style.captionContainer}>Total Invested</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(mutualFundsData.mfSummary?.currentAmount)}
        </span>
        <span className={style.captionContainer}>Current Value</span>
      </div>
      <div className={style.infoContainer}>
        <span>{formattedCurrency(mutualFundsData.mfSummary?.change)}</span>
        <span className={style.captionContainer}>Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>{mutualFundsData.mfSummary?.percentChange}%</span>
        <span className={style.captionContainer}>% Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>{mutualFundsData.mfSummary?.securityCount}</span>
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

export default MutualFundsSummaryBox
