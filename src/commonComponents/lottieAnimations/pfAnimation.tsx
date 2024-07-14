import React from 'react'

import Lottie from 'lottie-react'
import animationData from './pfAnimation.json'

const PfLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default PfLottie
