import React from 'react'

import Lottie from 'lottie-react'
import animationData from './loaderAnimation.json'

const LoaderLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default LoaderLottie
