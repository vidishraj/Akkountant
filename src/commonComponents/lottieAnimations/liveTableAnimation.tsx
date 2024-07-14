import React from 'react'

import Lottie from 'lottie-react'
import animationData from './liveTableAnimation.json'

const LiveTableLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default LiveTableLottie
