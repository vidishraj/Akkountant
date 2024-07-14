interface uploadToFileIcon {
  width: number
  height: number
  onClick?: any
}

const UploadToCloudIcon: React.FC<uploadToFileIcon> = (props) => {
  const { width, height, onClick } = props
  return (
    <span onClick={onClick}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={width}
        height={height}
        viewBox='0 0 48 48'
      >
        <path d='M0 0h48v48h-48z' fill='none' />
        <path d='M38.71 20.07c-1.36-6.88-7.43-12.07-14.71-12.07-5.78 0-10.79 3.28-13.3 8.07-6.01.65-10.7 5.74-10.7 11.93 0 6.63 5.37 12 12 12h26c5.52 0 10-4.48 10-10 0-5.28-4.11-9.56-9.29-9.93zm-10.71 5.93v8h-8v-8h-6l10-10 10 10h-6z' />
      </svg>
    </span>
  )
}

export default UploadToCloudIcon
