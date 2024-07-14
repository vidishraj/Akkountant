import React from 'react'

import Lottie from 'lottie-react'
import animationData from './goldCoinAnimation.json'

const GoldCoinLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default GoldCoinLottie
