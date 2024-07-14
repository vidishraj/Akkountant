import { Button, Card, CardContent, TextField } from '@mui/material'
import { useState } from 'react'
import { browserLocalPersistence, getAuth } from 'firebase/auth'
import { signInWithEmailAndPassword } from 'firebase/auth'
import './loginPage.css'
import { useMessage } from '../contexts/messageContext'
import { useGlobal } from '../contexts/globalContext'
import { useNavigate } from 'react-router-dom'
import { initializeApp } from '@firebase/app'
import { useLoader } from '../contexts/loaderContext'
import DarkModeLoader from '../commonComponents/basicLoader/basicLoader'
import LoginPageLottie from '../commonComponents/lottieAnimations/loginBackgroundAnimated'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDER,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID,
}

export const app = initializeApp(firebaseConfig)
const Login = () => {
  // eslint-disable-next-line
  const auth = getAuth(app).setPersistence(browserLocalPersistence)
  const currentAuth = getAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { setPayload } = useMessage()
  const { setSignedIn } = useGlobal()
  currentAuth.onAuthStateChanged((user) => {
    if (user) {
      setSignedIn(true)
      navigate('/home')
    }
  })
  const { status, setStatus } = useLoader()
  const handleSend = (event) => {
    event.preventDefault()
    setStatus((prev) => ({
      ...prev,
      loginPageStatus: true,
    }))
    signInWithEmailAndPassword(currentAuth, email, password)
      .then((confirmationResult) => {
        setPayload({
          message: `Signed in successfully.`,
          type: 'success',
        })
        setStatus((prev) => ({
          ...prev,
          loginPageStatus: false,
        }))
        setSignedIn(true)
        navigate('/home')
      })
      .catch((error) => {
        setPayload({
          message: `Error during sign in. ${error}`,
          type: 'warning',
        })
        setStatus((prev) => ({
          ...prev,
          loginPageStatus: false,
        }))
      })
  }

  return (
    <>
      <DarkModeLoader status={status.loginPageStatus}>
        <div className='homePage'>
          <LoginPageLottie></LoginPageLottie>
        </div>
        <div className='app__container'>
          <>
            <Card className='loginCard'>
              <CardContent className='cardContent'>
                <form onSubmit={handleSend}>
                  <TextField
                    color='success'
                    className='textfield'
                    variant='outlined'
                    autoComplete='off'
                    label='Email'
                    value={email}
                    type={'email'}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <TextField
                    className='textfield'
                    variant='outlined'
                    autoComplete='off'
                    label='Password'
                    type={'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <Button
                    type='submit'
                    className='submitButton'
                    variant='contained'
                    sx={{ width: '240px', marginTop: '20px' }}
                  >
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div id='recaptcha'></div>
          </>
        </div>
      </DarkModeLoader>
    </>
  )
}

export default Login
