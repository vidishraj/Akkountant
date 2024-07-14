import React from 'react'

import Lottie from 'lottie-react'
import animationData from './transactionTableAnimation.json'

const TransactionTableAnimation = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default TransactionTableAnimation
