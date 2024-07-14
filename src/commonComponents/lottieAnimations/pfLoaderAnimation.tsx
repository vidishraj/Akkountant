import React from 'react'

import Lottie from 'lottie-react'
import animationData from './pfLoaderAnimation.json'

const PFLoaderAnimation = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default PFLoaderAnimation
