import React from 'react'

interface BankIconProps {
  width: number
  height: number
  style: React.CSSProperties
  onClick?: () => void
}

const BankIcon: React.FC<BankIconProps> = ({
  style,
  width,
  height,
  onClick,
}) => {
  return (
    <img
      style={style}
      alt='bankIcon'
      width={width}
      height={height}
      src='homePage\Bank.png'
    ></img>
  )
}

export default BankIcon
