import React, { LegacyRef, useRef, useState } from 'react'
import './FileUploadBox.css'
import { useMessage } from '../../../contexts/messageContext'
import { fileUploader } from '../../../api/transactionPageAPI'
import { useLoader } from '../../../contexts/loaderContext'
import UploadFileLottie from '../../../commonComponents/lottieAnimations/uploadFileAnimation'
import Dropdown from '../../../commonComponents/dropDown/dropDown'
import UploadFile2Lottie from '../../../commonComponents/lottieAnimations/uploadFileAnimation2'
interface FileUploadBoxProps {
  dropDownValue: string
  refreshTable: any
  dropDownSelect: any
}

const FileUploadBox: React.FC<FileUploadBoxProps> = (props) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const inputRef: LegacyRef<HTMLInputElement> = useRef()
  const { setPayload } = useMessage()
  const { setStatus } = useLoader()
  const { dropDownValue, refreshTable, dropDownSelect } = props
  const dropDownOptions = [
    { label: 'HDFC Credit', value: 'HDFC_Credit' },
    { label: 'HDFC Debit', value: 'HDFC_Debit' },
    { label: 'Bank of India', value: 'BOI' },
    { label: 'ICICI Amazon', value: 'ICICI' },
  ]
  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'application/pdf' || file.type === 'text/csv')) {
      setUploadedFile(file)
    } else if (file) {
      setPayload({
        message: 'File uploaded is not a PDF or CSV',
        type: 'error',
      })
      setUploadedFile(null)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (
      file &&
      (file.type === 'application/pdf' ||
        file.type === 'text/csv' ||
        file.type === 'text/plain')
    ) {
      setUploadedFile(file)
    } else if (file) {
      setPayload({
        message: 'File uploaded is not a PDF or CSV',
        type: 'error',
      })
      setUploadedFile(null)
      event.target.value = null
    }
  }

  const handleUpload = async (event) => {
    if (dropDownValue === undefined) {
      setPayload({
        message: 'Please select the statement type',
        type: 'error',
      })
      return
    }
    if (uploadedFile) {
      let file = uploadedFile
      let formData = new FormData()
      formData.append('myFile', file)
      formData.append('fileType', dropDownValue)
      let startTime = null
      let endTime = null
      try {
        setStatus((prev) => ({
          ...prev,
          uploadBoxStatus: true,
        }))
        startTime = new Date().getTime()
        const response = await fileUploader(formData)
        endTime = new Date().getTime()
        if (response.status === 200) {
          setPayload({
            message: 'File uploaded successfully.',
            type: 'success',
          })
          refreshTable(true)
        } else {
          setPayload({
            message: `File upload failed. ${response.data.Error}`,
            type: 'error',
          })
        }
      } catch (error) {
        endTime = new Date().getTime()
        if (
          endTime &&
          startTime &&
          endTime - startTime > 25500 &&
          endTime - startTime < 30000
        ) {
          setPayload({
            message: `File upload is taking longer than usual. Please come back and check later.`,
            type: 'warning',
          })
        } else {
          setPayload({
            message: `File upload failed in the backend. ${error}`,
            type: 'error',
          })
        }
      } finally {
        setStatus((prev) => ({
          ...prev,
          uploadBoxStatus: false,
        }))
      }
      if (inputRef) {
        inputRef.current.value = null
      }
    } else {
      setPayload({
        message: 'Upload a file',
        type: 'error',
      })
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div>
        <UploadFile2Lottie style={{ width: '25vw', height: '30vh' }} />
      </div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
        }}
      >
        <Dropdown
          heading='Select Bank'
          className={'dropDown'}
          options={dropDownOptions}
          onSelect={dropDownSelect}
        />
        <div
          className={` box ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className='box-input'>
            <svg
              className='box__icon'
              xmlns='http://www.w3.org/2000/svg'
              width='50'
              height='43'
              viewBox='0 0 50 43'
            >
              <path d='M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z'></path>
            </svg>
            <input
              ref={inputRef}
              onChange={handleFileChange}
              type='file'
              name='files[]'
              id='file'
              className='box__file'
              data-multiple-caption='{count} files selected'
              multiple={false}
            ></input>
            <label htmlFor='file'>
              <strong>Select a PDF/CSV file</strong>
              <span className={`drop-zone ${isDragging ? 'dragging' : ''}`}>
                or drag it here
              </span>
            </label>
            {uploadedFile ? (
              <p className='file-preview-font'>{uploadedFile.name}</p>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className='butContainer'>
          <button type='submit' onClick={handleUpload} className='box__button'>
            Upload
          </button>
        </div>
      </div>

      <div>
        <UploadFileLottie style={{ width: '25vw', height: '30vh' }} />
      </div>
    </div>
  )
}

export default FileUploadBox
