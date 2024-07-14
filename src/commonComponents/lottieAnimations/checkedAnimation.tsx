import React from 'react'
import Lottie from 'lottie-react'
import animationData from './checkedAnimation.json'
import loadingData from './investmentLoader.json'
const CheckedLottie = ({ style, dataList }) => {
  return dataList ? (
    <Lottie style={style} animationData={animationData} loop={false} />
  ) : (
    <Lottie style={style} animationData={loadingData} loop={true} />
  )
}

export default CheckedLottie
