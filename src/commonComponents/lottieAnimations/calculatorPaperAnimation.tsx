import React from 'react'
import Lottie from 'lottie-react'
import animationData from './calculatorPaperAnimation.json'

const CalculatorPaperLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default CalculatorPaperLottie
