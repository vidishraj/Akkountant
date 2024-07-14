import React from 'react'

import Lottie from 'lottie-react'
import animationData from './loginPageLottie.json'

const LoginPageLottie = () => {
  return (
    <Lottie
      style={{ height: '100vh', position: 'absolute', paddingLeft: '10vw' }}
      animationData={animationData}
      loop={true}
    />
  )
}

export default LoginPageLottie
