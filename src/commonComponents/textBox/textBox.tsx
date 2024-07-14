import React from 'react'

interface TextBoxProps {
  text: string
}
const TextBox: React.FC<TextBoxProps> = (props) => {
  const { text } = props
  return <span>{text}</span>
}

export default TextBox
