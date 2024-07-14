import React from 'react'

import Lottie from 'lottie-react'
import animationData from './ppfLoaderAnimation.json'

const PPFLoaderAnimation = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default PPFLoaderAnimation
