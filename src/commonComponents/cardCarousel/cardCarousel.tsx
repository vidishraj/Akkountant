import { useState, useEffect } from 'react'
import style from './cardCarousel.module.scss'

const removeDuplicates = (arr) => {
  let checker = {}
  let uniqueArr = []
  arr.forEach((element) => {
    if (
      checker[element.itemName] === undefined &&
      element.color !== undefined
    ) {
      uniqueArr.push(element)
    }
    checker[element.itemName] = 1
  })
  return uniqueArr
}

const Carousel = ({ carouselData }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardList, setCardList] = useState([])
  useEffect(() => {
    const uniqueArr = removeDuplicates(carouselData)
    setCardList(uniqueArr)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [carouselData])

  return (
    <div className={style.innerContainer}>
      {cardList.map((item, index) => (
        <div
          key={index}
          className={style.card}
          style={{
            transition: 'transform 1s ease',
            transform: `translateX(-${currentIndex * 300}px)`,
            backgroundColor: item.color,
          }}
        >
          <div className={style.cardValues}>
            <div className={style.colOne}>
              <div className={style.value}>
                {parseFloat(item.investedAmount).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                })}
                <span className={style.caption}>Invested</span>
              </div>
              <div className={style.value}>
                {parseFloat(item.total).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                })}
                <span className={style.caption}>Current</span>
              </div>
            </div>
            <div className={style.colTwo}>
              <div className={style.value}>
                {parseFloat(item.change).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                })}
                <span className={style.caption}>Change</span>
              </div>
              <div
                style={{
                  color: item.investedAmount < item.total ? 'green' : 'red',
                }}
                className={style.value}
              >
                {((item.change / item.investedAmount) * 100).toFixed(2)}%
                <span
                  style={{
                    color: item.investedAmount < item.total ? 'green' : 'red',
                  }}
                  className={style.caption}
                >
                  Change %
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Carousel
