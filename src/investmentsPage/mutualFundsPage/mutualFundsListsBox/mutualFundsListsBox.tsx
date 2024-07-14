import { motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { useMutualFundsContext } from '../../../contexts/mutualFundsContext'
import style from './mutualFundsListsBox.module.scss'
interface StocksListBoxProps {}

const MutualFundsListBox: React.FC<StocksListBoxProps> = () => {
  const { mutualFundsData, dispatch } = useMutualFundsContext()

  function setSummaryData() {
    if (mutualFundsData.mfList) {
      let investedAmount = 0
      let currentAmount = 0
      let change = 0
      let percentChange = 0
      let securityCount = 0
      mutualFundsData.mfList.forEach((stock: any) => {
        investedAmount += stock.investedAmount
        currentAmount += stock.quantity * stock.latestNav
      })
      change = currentAmount - investedAmount
      securityCount = mutualFundsData.mfList.length
      percentChange = (change / investedAmount) * 100
      dispatch({
        type: 'UPDATE_MF_SUMMARY',
        payload: {
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
      type: 'UPDATE_MF_INFO',
      payload: {
        ...mutualFundsData.mfList[index],
        purchased: true,
      },
    })
  }

  return (
    <div className={style.stocksListContainer}>
      {mutualFundsData?.mfList?.map((element: any, index) => {
        return (
          <MFBox
            Name={element.schemeName}
            CurrentNav={element.latestNav}
            onClickEvent={() => stockSelected(index)}
          />
        )
      })}
    </div>
  )
}

const MFBox = ({ Name, CurrentNav, onClickEvent }) => {
  return (
    <motion.div
      onClick={onClickEvent}
      className={style.stockBox}
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
    >
      <div className={style.stockName}>{Name}</div>
      <div
        className={style.trend}
        style={{ color: CurrentNav > 0 ? '#4caf50' : 'red' }}
      >
        {CurrentNav}
      </div>
    </motion.div>
  )
}

export default MutualFundsListBox
