import React from 'react'

import Lottie from 'lottie-react'
import animationData from './fdLoaderAnimation.json'

const FDLoaderLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default FDLoaderLottie
