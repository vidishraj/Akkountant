import './basicLoader.css'
import LoaderLottie from '../lottieAnimations/loaderAnimation'

const DarkModeLoader = (props) => {
  const { status } = props
  return (
    <div style={{ height: '100vh' }}>
      {status ? (
        <>
          <div className='dark-mode-loader'>{props.children}</div>
          <div className='loader'>
            <LoaderLottie
              style={{ width: 'fit-content', height: 'fit-content' }}
            />
          </div>
        </>
      ) : (
        <div>{props.children}</div>
      )}
    </div>
  )
}

export default DarkModeLoader
