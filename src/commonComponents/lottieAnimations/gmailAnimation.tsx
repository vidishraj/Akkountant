import React from 'react'

import Lottie from 'lottie-react'
import animationData from './gmailAnimation.json'

const GmailLottie = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default GmailLottie
