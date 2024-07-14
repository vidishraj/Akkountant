import { FirebaseApp } from '@firebase/app'
import React, { createContext, useState, useContext } from 'react'

interface globalContextProps {
  app: FirebaseApp
  setApp: any
  signedIn: boolean
  setSignedIn: any
  autoTagOpen: boolean
  setAutoTagOpen: any
  details: string
  setDetails: any
}
// Create a context
const GlobalContext = createContext<globalContextProps>({
  signedIn: false,
  app: null,
  setApp: () => {},
  setSignedIn: () => {},
  autoTagOpen:false,
  setAutoTagOpen:()=>{},
  details:"",
  setDetails:()=>{}
})

// Create a provider component
const GlobalContextProvider = ({ children }) => {
  const [payload, setPayload] = useState(true)
  const [app, setApp] = useState(null)
  const [autoTagOpen, setAutoTagOpen] = useState(false)
  const [details, setDetails] = useState<string>("")
  return (
    <GlobalContext.Provider
      value={{
        signedIn: payload,
        app: app,
        setApp: setApp,
        setSignedIn: setPayload,
        autoTagOpen:autoTagOpen,
        setAutoTagOpen:setAutoTagOpen,
        details:details,
        setDetails:setDetails
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

// Create a custom hook to consume the context
const useGlobal = () => {
  const context = useContext(GlobalContext)
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider')
  }
  return context
}

export { GlobalContextProvider, useGlobal }
