import { useEffect, useState } from 'react'
import { List } from './homeCards/homeCards'
import { HomeContext } from '../contexts/homeContext'
import { useGlobal } from '../contexts/globalContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMessage } from '../contexts/messageContext'
import Header from '../commonComponents/header/header'
import './homePage.css'
import { makeDriveTokenRequest, makeTokenRequest } from '../api/googleAuthAPI'
import LandingPageLottie from '../commonComponents/lottieAnimations/landingPageAnimated'

const HomePage = () => {
  const [pageNumber, setPageNumber] = useState<number>(0)
  // eslint-disable-next-line
  const [searchParams, setSearchParams] = useSearchParams()
  const { signedIn } = useGlobal()
  const { setPayload } = useMessage()
  const navigate = useNavigate()

  useEffect(() => {
    if (!signedIn) {
      setPayload({
        message: 'User must sign in first',
        type: 'warning',
      })
      navigate('/')
    }
    const scope: string = searchParams.get('scope')
//?code=4/0AfJohXmjKpd5djJtEi9y3Zye8Tf0K5VIWIC3kF3iKeIg1bItjnD1xQvZF1R1y7O-O1H01g&scope=https://www.googleapis.com/auth/gmail.readonly
    if (searchParams.get('code')?.length > 0) {
      if (scope.endsWith('drive.file')) {
        makeDriveTokenRequest(searchParams.get('code')).catch((error) => {
          setPayload({
            message: `Error while updating drive token ${error}`,
            type: 'error',
          })
        })
      } else {
        makeTokenRequest(searchParams.get('code')).catch((error) => {
          setPayload({
            message: `Error while updating drive token ${error}`,
            type: 'error',
          })
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  var id = 0
  return (
    <>
      <Header navigater={navigate}></Header>
      <div className='homePage'>
        <div className='backgroundAnimation'>
          <LandingPageLottie />
        </div>
        <HomeContext.Provider
          value={{
            homeStates: { selectedId: pageNumber },
            setHomeState: setPageNumber,
          }}
        >
          <List
            selectedId={id}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
        </HomeContext.Provider>
      </div>
    </>
  )
}

export default HomePage
