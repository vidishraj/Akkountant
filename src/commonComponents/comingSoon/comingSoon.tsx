import Header from '../header/header'
import { useNavigate } from 'react-router-dom'

export const ComingSoon = () => {
  const navigate = useNavigate()
  return (
    <>
      <Header navigater={navigate} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <span style={{ color: 'black', fontSize: '30px' }}>
          All Good Things Take Time....
        </span>
      </div>
    </>
  )
}
