import GoldCard from '../cardInfo/goldCard'
import style from './carousel.module.scss'
import { useState } from 'react'
import { useGoldContext } from '../../../contexts/goldContext'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft'

export const Carousel = () => {
  const { goldData } = useGoldContext()
  return (
    <div className={style.carouselContainer}>
      <Carousel1 data={goldData.goldList} />
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
        <GoldCard data={data[currentIndex]} />
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
