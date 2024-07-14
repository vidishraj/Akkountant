import { motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { PensionSchemeData, useNPSContext } from '../../../contexts/npsContext'
import style from './npsListBox.module.scss'
interface NPSListBoxProps {}

const NpsListBox: React.FC<NPSListBoxProps> = () => {
  const { npsData, dispatch } = useNPSContext()

  function setSummaryData() {
    if (npsData.npsList) {
      let investedAmount = 0
      let currentAmount = 0
      let change = 0
      let percentChange = 0
      let securityCount = 0
      npsData.npsList.forEach((stock: PensionSchemeData) => {
        investedAmount += stock.investedAmount
        currentAmount += stock.investedQuant * stock.currentNAV
      })
      change = currentAmount - investedAmount
      securityCount = npsData.npsList.length
      percentChange = (change / investedAmount) * 100
      dispatch({
        type: 'UPDATE_NPS_SUMMARY',
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

  function npsSelected(index) {
    dispatch({
      type: 'UPDATE_NPS_INFO',
      payload: {
        ...npsData.npsList[index],
        purchased: true,
      },
    })
  }

  return (
    <div className={style.stocksListContainer}>
      {npsData?.npsList?.map((element: any, index) => {
        return (
          <NPSBox
            key={element.schemeCode}
            Name={element.schemeName}
            CurrentNav={element.currentNAV}
            onClickEvent={() => npsSelected(index)}
          />
        )
      })}
    </div>
  )
}

const NPSBox = ({ Name, CurrentNav, onClickEvent }) => {
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

export default NpsListBox
