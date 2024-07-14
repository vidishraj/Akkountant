import React, { useState } from 'react'
import './collapsibleDiv.css'
import { motion, AnimatePresence } from 'framer-motion'
import CheckedLottie from '../lottieAnimations/checkedAnimation'
import { Button } from '@mui/material'

interface CollapsibleDivProps {
  title: string
  body: any
  style: any
  onClickHandler: any
  height: string
  dataList: any
}

const CollapsibleDiv: React.FC<CollapsibleDivProps> = (props) => {
  const { title, body, style, dataList } = props
  const [isOpen, setIsOpen] = useState(false)
  const toggleOpen = () => {
    if (dataList) {
      setIsOpen(!isOpen)
    }
  }
  return (
    <>
      {isOpen ? (
        <div className='absoluteDiv'>
          <div className='parentDiv' style={{ ...style }} onClick={toggleOpen}>
            <h3>{title}</h3>
            <div className='sideButton'>
              <CheckedLottie
                style={{
                  maxWidth: '70px',
                  maxHeigth: '10px',
                  paddingRight: '20px',
                }}
                dataList={dataList}
              />
              <Button
                onClick={() => setIsOpen(false)}
                variant='contained'
                color='error'
                style={{ height: 'fit-content' }}
              >
                Close
              </Button>
            </div>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className='collapsibleDiv'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '100%' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {body}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className='parentDiv' style={{ ...style }} onClick={toggleOpen}>
          <h3>{title}</h3>
          <CheckedLottie
            style={{
              maxWidth: '70px',
              maxHeigth: '10px',
              paddingRight: '20px',
            }}
            dataList={dataList}
          />
        </div>
      )}
    </>
  )
}

export default CollapsibleDiv
