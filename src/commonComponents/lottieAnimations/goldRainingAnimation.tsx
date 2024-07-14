import React from 'react'

import Lottie from 'lottie-react'
import animationData from './goldRainingAnimation.json'

const GoldRainingLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default GoldRainingLottie
