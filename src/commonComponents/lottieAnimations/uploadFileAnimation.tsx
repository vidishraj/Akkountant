import React from 'react'

import Lottie from 'lottie-react'
import animationData from './uploadFileAnimation.json'

const UploadFileLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default UploadFileLottie
