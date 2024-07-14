import { formattedCurrency } from '../../stocksPage/stocksSummaryBox/stocksSummaryBox'
import React from 'react'
import style from './pfSummaryBox.module.scss'
import { PF, usePFContext } from '../../../contexts/pfContext'
import { sortedData } from '../pfDialogs/pfInsertDialog'
interface PFSummaryBoxProps {}

const PFSummaryBox: React.FC<PFSummaryBoxProps> = () => {
  const pfCtx = usePFContext()

  return (
    <div className={style.ppfSummaryBox}>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(
            pfCtx?.pfData?.pfSummary?.investedAmount?.toString(),
          )}
        </span>
        <span className={style.captionContainer}>Total Invested</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(
            pfCtx?.pfData?.pfSummary?.currentAmount?.toString(),
          )}
        </span>
        <span className={style.captionContainer}>Current Value</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {formattedCurrency(pfCtx?.pfData?.pfSummary?.change?.toString())}
        </span>
        <span className={style.captionContainer}>Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {(
            (pfCtx?.pfData?.pfSummary?.change /
              pfCtx?.pfData?.pfSummary?.investedAmount) *
            100
          ).toFixed(2)}
          %
        </span>
        <span className={style.captionContainer}>% Change</span>
      </div>
      <div className={style.infoContainer}>
        <span>{pfCtx?.pfData?.pfSummary?.duration} yrs</span>
        <span className={style.captionContainer}>Duration</span>
      </div>
    </div>
  )
}

const calculateYearsDifference = (startDate: string): number => {
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  }

  const [startMonth, startYear] = startDate.split('-')
  const currentDate = new Date()

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  if (months.hasOwnProperty(startMonth)) {
    const startMonthIndex = months[startMonth]
    const startYearNum = parseInt(startYear, 10)

    const yearDifference = currentYear - startYearNum
    const monthDifference = currentMonth - startMonthIndex

    const yearsInDecimal = yearDifference + monthDifference / 12
    return Number(yearsInDecimal.toFixed(2))
  }

  return -1
}

export function setPFSummary(pfList, interestList, dispatch) {
  if (pfList.length > 0) {
    let data: PF[] = sortedData(pfList)
    let totalInvested = 0
    let currentValue = 0
    let change = 0
    let duration = calculateYearsDifference(data[0].wageMonth)
    data.forEach((element) => {
      totalInvested += element.empShare + element.emplyrShare
    })
    interestList.forEach((element) => {
      change += parseFloat(element.interest)
    })
    currentValue = change + totalInvested
    dispatch({
      type: 'UPDATE_PF_SUMMARY',
      payload: {
        investedAmount: totalInvested,
        change: change,
        currentAmount: currentValue,
        investmentCount: interestList.length,
        duration: duration,
      },
    })
  }
}

export default PFSummaryBox
