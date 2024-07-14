import React from 'react'

import Lottie from 'lottie-react'
import animationData from './fdLeftAnimation.json'

const FDLeftAnimation = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default FDLeftAnimation
