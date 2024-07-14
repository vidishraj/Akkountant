import React from 'react'
import './searchBar.css'
import Dropdown from '../dropDown/dropDown'

interface SearchBarProps {
  onDropDownChange: any
  onInputChange: any
}

const SearchBar: React.FC<SearchBarProps> = (props) => {
  const { onDropDownChange, onInputChange } = props

  const searchOptions = [
    { label: 'Details', value: 'details' },
    { label: 'Tag', value: 'tag' },
  ]
  return (
    <div className='search-container'>
      <input
        type='text'
        placeholder=''
        className='inputContainer'
        onChange={onInputChange}
      />
      <label className='label'>Search</label>
      <Dropdown
        optionsClass={'optionsClass'}
        className={'dropdown'}
        options={searchOptions}
        onSelect={onDropDownChange}
      />
    </div>
  )
}

export default SearchBar
