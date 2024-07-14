import React from 'react'

import Lottie from 'lottie-react'
import animationData from './goldBrickAnimation.json'

const GoldBricksLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default GoldBricksLottie
