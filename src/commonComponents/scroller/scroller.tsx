import React, { useState, useEffect } from 'react'
import './scroller.css' // Create this CSS file for styling

const ScrollDownArrow = () => {
  const [currentScrollPostion, setScrollPosition] = useState<number>(0)

  useEffect(() => {
    setInitialPosition()
    window.addEventListener('scroll', setInitialPosition)

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('scroll', setInitialPosition)
    }
  }, [])

  function setInitialPosition() {
    const viewPortHeight = window.innerHeight
    const totalPageHeight = viewPortHeight * 4 + 50
    const currentPosition = window.scrollY
    const halfViewPortHeight = Math.floor(viewPortHeight / 2)
    setScrollPosition(
      currentPosition !== 0
        ? Math.floor(
            (currentPosition - halfViewPortHeight) / (totalPageHeight / 4),
          ) + 1
        : 0,
    )
  }

  const handleClickDown = () => {
    if (currentScrollPostion < 3) {
      setScrollPosition(currentScrollPostion + 1)
      const viewPortHeight = window.innerHeight
      window.scrollTo({
        top: viewPortHeight * (currentScrollPostion + 1),
        behavior: 'smooth',
      })
    }
  }

  const handleClickUp = () => {
    if (currentScrollPostion > 0) {
      setScrollPosition(currentScrollPostion - 1)
      const viewPortHeight = window.innerHeight
      window.scrollTo({
        top: viewPortHeight * (currentScrollPostion - 1),
        behavior: 'smooth',
      })
    }
  }

  return (
    <>
      <div className='scroll-up-arrow' onClick={handleClickUp}>
        <span className='arrow'>&#9650;</span>
      </div>
      <div className='scroll-down-arrow' onClick={handleClickDown}>
        <span className='arrow'>&#9660;</span>
      </div>
    </>
  )
}

export default ScrollDownArrow
