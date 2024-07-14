import React from 'react'

import Lottie from 'lottie-react'
import animationData from './mutualFundsLottieAnimation.json'

const MutualFundsLoaderLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default MutualFundsLoaderLottie
