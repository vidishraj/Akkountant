import React, { createContext, useState, useContext } from 'react'

interface LoaderContextProp {
  status: {
    mainTransactionStatus: boolean
    uploadPageStatus: boolean
    liveTableStatus: boolean
    loginPageStatus: boolean
    uploadBoxStatus: boolean
    stockBoxStatus: boolean
    mfBoxStatus: boolean
    goldBoxStatus: boolean
    ppfBoxStatus: boolean
    pfBoxStatus: boolean
    fdBoxStatus: boolean
    npsBoxStatus: boolean
  }
  setStatus: any
}

const LoaderContext = createContext<LoaderContextProp>({
  status: {
    mainTransactionStatus: false,
    uploadPageStatus: false,
    liveTableStatus: false,
    loginPageStatus: false,
    uploadBoxStatus: false,
    stockBoxStatus: false,
    goldBoxStatus: false,
    mfBoxStatus: false,
    ppfBoxStatus: false,
    pfBoxStatus: false,
    fdBoxStatus: false,
    npsBoxStatus: false,
  },
  setStatus: () => {},
})

const LoaderProvider = ({ children }) => {
  const [payload, setPayload] = useState({
    mainTransactionStatus: false,
    uploadPageStatus: false,
    liveTableStatus: false,
    loginPageStatus: false,
    uploadBoxStatus: false,
    stockBoxStatus: false,
    mfBoxStatus: false,
    goldBoxStatus: false,
    ppfBoxStatus: false,
    pfBoxStatus: false,
    fdBoxStatus: false,
    npsBoxStatus: false,
  })

  return (
    <LoaderContext.Provider value={{ status: payload, setStatus: setPayload }}>
      {children}
    </LoaderContext.Provider>
  )
}

const useLoader = () => {
  const context = useContext(LoaderContext)
  if (context === undefined) {
    throw new Error('useLoader is not defined.')
  }
  return context
}

export { LoaderProvider, useLoader }
