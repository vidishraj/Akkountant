import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft'
import { deleteFDDeposit, fetchFD } from '../../../api/investmentsAPI.tsx/fdAPI'
import DeleteIcon from '@mui/icons-material/Delete'
import { Button } from '@mui/material'
import { useFDContext } from '../../../contexts/fdContext'
import style from './fdBox.module.scss'
import { useState } from 'react'
import { useLoader } from '../../../contexts/loaderContext'
import { useMessage } from '../../../contexts/messageContext'

const Carousel = () => {
  const fdCtx = useFDContext()

  return (
    <div className={style.carouselContainer}>
      {fdCtx.fdData.fdList.length > 0 && (
        <Carousel1 data={fdCtx.fdData.fdList} />
      )}
    </div>
  )
}

const Carousel1 = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const nextSlide = () => {
    currentIndex === data.length - 1
      ? setCurrentIndex(0)
      : setCurrentIndex(currentIndex + 1)
  }

  const prevSlide = () => {
    currentIndex === 0
      ? setCurrentIndex(data.length - 1)
      : setCurrentIndex(currentIndex - 1)
  }

  return (
    <div className={style.carouselContainer}>
      <button
        style={{ margin: 0, padding: 0, border: 0, background: 'none' }}
        onClick={prevSlide}
      >
        <ArrowCircleLeftIcon color='action' className={style.left} />
      </button>
      <div className={style.card}>
        <FDCard items={data[currentIndex]} />
      </div>
      <button
        style={{ margin: 0, padding: 0, border: 0, background: 'none' }}
        onClick={nextSlide}
      >
        <ArrowCircleRightIcon color='action' className={style.right} />
      </button>
    </div>
  )
}

const FDCard = (props) => {
  const { items } = props
  const fdCtx = useFDContext()
  const { setPayload } = useMessage()
  const { setStatus } = useLoader()
  function formatDate(dateString) {
    if (dateString !== undefined) {
      const [day, month, year] = dateString.split('/')
      const date = new Date(`${year}-${month}-${day}`)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
    return dateString
  }
  function addMonthsToDate(dateString: string, monthsToAdd: number): string {
    if (dateString !== undefined) {
      const [day, month, year] = dateString.split('/').map(Number)
      const date = new Date(year, month - 1, day)
      date.setMonth(date.getMonth() + monthsToAdd)
      return `${date.getDate().toString().padStart(2, '0')}-${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`
    }
    return dateString
  }
  function deleteDeposit(id) {
    setStatus((prev) => ({
      ...prev,
      fdBoxStatus: true,
    }))
    let data = new FormData()
    data.append('id', id)
    deleteFDDeposit(data)
      .then(() => {
        fetchFD(true)
          .then((response) => {
            fdCtx.dispatch({
              type: 'UPDATE_FD',
              payload: response.data.Message,
            })
          })
          .finally(() => {
            setStatus((prev) => ({
              ...prev,
              fdBoxStatus: false,
            }))
          })
      })
      .catch((error) => {
        setPayload({
          type: 'error',
          message: `Error while inserting fd ${error}`,
        })
        setStatus((prev) => ({
          ...prev,
          fdBoxStatus: false,
        }))
      })
  }

  return (
    <div className={style.cardBox}>
      <div className={style.infoContainer}>
        <span> {formatDate(items.investmentDate)} </span>
        <span className={style.captionContainer}>Date</span>
      </div>
      <div className={style.infoContainer}>
        <span>{items.interestRate}%</span>
        <span className={style.captionContainer}>Interest Rate</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {' '}
          {parseFloat(items.investedAmount).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })}
        </span>
        <span className={style.captionContainer}>Invested</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {' '}
          {formatDate(
            addMonthsToDate(items.investmentDate, items.investmentDuration),
          )}
        </span>
        <span className={style.captionContainer}>Maturity Date</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {parseFloat(items.maturityAmount).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })}
        </span>
        <span className={style.captionContainer}>Maturity Amount</span>
      </div>
      <div className={style.infoContainer}>
        <span>{items.investmentBank}</span>
        <span className={style.captionContainer}>Bank</span>
      </div>
      <Button
        onClick={() => deleteDeposit(items.depositID)}
        className={style.deleteButton}
        variant='contained'
        color='error'
        startIcon={<DeleteIcon />}
      >
        {' '}
        Delete{' '}
      </Button>
    </div>
  )
}

export default Carousel
