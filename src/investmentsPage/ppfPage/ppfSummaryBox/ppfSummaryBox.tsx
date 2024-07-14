import { formattedCurrency } from '../../stocksPage/stocksSummaryBox/stocksSummaryBox'
import React from 'react'
import style from './ppfSummaryBox.module.scss'
import { usePPFContext } from '../../../contexts/ppfContext'
interface PPFSummaryBoxProps {}

const PPFSummaryBox: React.FC<PPFSummaryBoxProps> = () => {
  const ppfCtx = usePPFContext()

  return (
    <div className={style.ppfSummaryBox}>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(
            ppfCtx?.ppfData?.ppfSummary?.investedAmount?.toString(),
          )}
        </span>
        <span className={style.captionContainer}>Total Invested</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(
            ppfCtx?.ppfData?.ppfSummary?.currentAmount?.toString(),
          )}
        </span>
        <span className={style.captionContainer}>Current Value</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(ppfCtx?.ppfData?.ppfSummary?.change?.toString())}
        </span>
        <span className={style.captionContainer}>Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {(
            (ppfCtx?.ppfData?.ppfSummary?.change /
              ppfCtx?.ppfData?.ppfSummary?.investedAmount) *
            100
          ).toFixed(2)}
          %
        </span>
        <span className={style.captionContainer}>% Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>{ppfCtx?.ppfData?.ppfSummary?.duration} yrs</span>
        <span className={style.captionContainer}>Duration</span>
      </div>
    </div>
  )
}

export default PPFSummaryBox
