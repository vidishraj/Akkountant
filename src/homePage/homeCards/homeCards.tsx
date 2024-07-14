import React from 'react'
import { items } from '../homeData'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './homeCards.css'

interface CardProps {
  id: number
  isSelected: boolean
  title: string
  category: string
  theme: string
  navUrl: any
  setPageNumber: any
}

function Card({ navUrl, id, title, category, theme }: CardProps) {
  return (
    <motion.li
      className={`card`}
      whileHover={{
        scale: 1.1,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.9 }}
    >
      <Link to={navUrl}>
        <div className='card-content-container'>
          <motion.div
            className='card-content'
            layoutId={`card-container-${id}`}
          >
            <motion.div
              className='card-image-container'
              layoutId={`card-image-container-${id}`}
            >
              <img
                style={{ backgroundColor: `${theme}` }}
                className='card-image'
                src={`homePage/${id}.png`}
                alt=''
              />
            </motion.div>
            <motion.div
              className='title-container'
              layoutId={`title-container-${id}`}
            ></motion.div>
            <span className='category'>{category}</span>
            <h2>{title}</h2>
          </motion.div>
        </div>
      </Link>
    </motion.li>
  )
}

interface ListProps {
  selectedId: number | null
  setPageNumber: any
  pageNumber: any
}

export function List({ selectedId, setPageNumber, pageNumber }: ListProps) {
  return (
    <ul id='main' className='card-list'>
      {items.map((card, index) => (
        <Card
          navUrl={card.navURL}
          setPageNumber={setPageNumber}
          id={card.id}
          theme={card.backgroundColor}
          title={card.title}
          category={card.category}
          isSelected={Number(card.id) === Number(pageNumber)}
        />
      ))}
    </ul>
  )
}
