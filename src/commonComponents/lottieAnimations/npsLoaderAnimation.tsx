import Lottie from 'lottie-react'
import animationData from './npsLoaderAnimation.json'

const NpsLoaderAnimation = ({ style }) => {
  return <Lottie style={style} animationData={animationData} loop={true} />
}

export default NpsLoaderAnimation
