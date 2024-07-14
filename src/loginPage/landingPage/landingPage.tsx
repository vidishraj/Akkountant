import { motion } from 'framer-motion'

const HomeLandingPage = () => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#222',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  }

  return (
    <motion.div
      style={containerStyles}
      initial='initial'
      animate='animate'
      className='landingContainer'
      onAnimationComplete={() => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
      }}
    >
      <motion.div>
        <img
          alt='homePage logo'
          width={300}
          height={300}
          src={'/homePage/logo.png'}
        ></img>
      </motion.div>
    </motion.div>
  )
}

export default HomeLandingPage
