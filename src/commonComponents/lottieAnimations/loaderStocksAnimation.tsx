import React from 'react'

import Lottie from 'lottie-react'
import animationData from './loaderStocksAnimation.json'

const LoaderStocksAnimation = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default LoaderStocksAnimation
