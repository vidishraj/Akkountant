import React from 'react'

import Lottie from 'lottie-react'
import animationData from './fdRightAnimation.json'

const FDRightAnimation = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default FDRightAnimation
