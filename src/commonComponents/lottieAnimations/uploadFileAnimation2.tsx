import React from 'react'

import Lottie from 'lottie-react'
import animationData from './uploadFileAnimation2.json'

const UploadFile2Lottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default UploadFile2Lottie
