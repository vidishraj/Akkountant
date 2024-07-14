import React, { useState } from 'react'

interface DropDownProps {
  options: any
  onSelect?: any
  className?: any
  heading?: any
  optionsClass?: any
}
const Dropdown: React.FC<DropDownProps> = (props) => {
  const [selectedOption, setSelectedOption] = useState('')
  const { options, onSelect, className, heading, optionsClass } = props
  const handleSelectChange = (event) => {
    const selectedValue = event.target.value
    setSelectedOption(selectedValue)
    onSelect(selectedValue)
  }

  return (
    <select
      className={className}
      value={selectedOption}
      onChange={handleSelectChange}
    >
      {heading && <option value=''>{heading}</option>}
      {options.map((option, index) => (
        <option className={optionsClass} key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default Dropdown
