import { Button } from '@mui/material'
import { getAuth, signOut } from 'firebase/auth'
import { Link } from 'react-router-dom'
import { useGlobal } from '../../contexts/globalContext'
import { useMessage } from '../../contexts/messageContext'
import { app } from '../../loginPage/loginPage'
import './header.css'

const Header = ({ navigater }) => {
  const { setSignedIn } = useGlobal()
  const { setPayload } = useMessage()

  function logOut() {
    let auth = getAuth(app)
    signOut(auth).then((response) => {
      navigater('/')
      setSignedIn(false)
      setPayload({
        message: 'Signed out.',
        type: 'warning',
      })
    })
  }
  return (
    <header className='headerWrapper'>
      <div className='linkWrapper'>
        <Link className='linkItem' to='/home'>
          Home
        </Link>
        <Link className='linkItem' to='/transactions'>
          Transactions
        </Link>
        <Link className='linkItem' to='/investments'>
          Investments
        </Link>
      </div>
      <Button className='logOutButton' onClick={logOut}>
        LogOut
      </Button>
    </header>
  )
}

export default Header
