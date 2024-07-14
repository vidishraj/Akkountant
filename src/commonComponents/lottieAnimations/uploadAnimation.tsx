import React from 'react'
import Lottie from 'lottie-react'
import animationData from './uploadAnimation.json'

const UploadTableLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default UploadTableLottie
