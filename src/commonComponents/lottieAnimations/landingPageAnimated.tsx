import React from 'react'

import Lottie from 'lottie-react'
import animationData from './landingPageLotties.json'

const LandingPageLottie = () => {
  return (
    <Lottie
      style={{ height: '100vh', width: '100vw' }}
      animationData={animationData}
      loop={true}
    />
  )
}

export default LandingPageLottie
