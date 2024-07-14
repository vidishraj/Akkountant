import React from 'react'

import Lottie from 'lottie-react'
import animationData from './savingPPFAnimation.json'

const SavingsPPFAnimation = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default SavingsPPFAnimation
