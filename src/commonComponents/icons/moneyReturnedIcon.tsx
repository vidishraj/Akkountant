import React from 'react'

interface MoneyReturnIconProps {
  width: number
  height: number
  style?: React.CSSProperties
  onClick?: () => void
}

const MoneyReturnIcon: React.FC<MoneyReturnIconProps> = ({
  style,
  width,
  height,
  onClick,
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox='0 0 64 64'
      strokeWidth='3'
      stroke='#000000'
      fill='none'
    >
      <path
        d='M55.5,31a23.93,23.93,0,0,1-.41,5.44,23.51,23.51,0,0,1-42.37,9'
        strokeLinecap='round'
      />
      <path
        d='M8.49,32.6a23.26,23.26,0,0,1,.42-5A23.51,23.51,0,0,1,51.2,18.43'
        strokeLinecap='round'
      />
      <polyline
        points='40.63 17.46 51.48 18.73 52.56 8.55'
        strokeLinecap='round'
      />
      <polyline
        points='23.08 46.19 12.24 44.92 11.15 55.1'
        strokeLinecap='round'
      />
      <path
        d='M25.79,22.57h2.92c2.85,0,6,.94,6,5.27,0,4.71-4,6.51-8.22,6a.25.25,0,0,0-.2.42l9,9.67'
        strokeLinecap='round'
      />
      <line x1='38.14' y1='22.57' x2='28.07' y2='22.57' strokeLinecap='round' />
      <line x1='25.94' y1='28' x2='38.21' y2='28' strokeLinecap='round' />
    </svg>
  )
}

export default MoneyReturnIcon
