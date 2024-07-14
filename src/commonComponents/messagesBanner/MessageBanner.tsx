import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css' // Import the CSS for styling
import { useMessage } from '../../contexts/messageContext'
import './MessageBanner.css' // Import your CSS file for styling

const NotificationMessage = (props) => {
  const { payload } = useMessage()

  let message = payload.message
  let type = payload.type

  const showSuccess = () => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 5000, // Close after 5 seconds
    })
  }

  const showWarning = () => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 5000,
    })
  }

  const showError = () => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
    })
  }

  useEffect(() => {
    if (message !== '') {
      if (type === 'error') {
        showError()
      } else if (type === 'success') {
        showSuccess()
      } else {
        showWarning()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload])

  return (
    <>
      <ToastContainer />
      {props.children}
    </>
  )
}

export default NotificationMessage
