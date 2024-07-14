import React, { createContext, useReducer, useContext } from 'react'

export interface PPF {
  amount: number
  interest: number
  month: string
  total: number
}

interface PPFSummary {
  investedAmount: any
  change: any
  currentAmount: any
  investmentCount: number
  duration: string
}

export interface PPFDeposit {
  id: number
  depositDate: string
  amount: number
}
interface PPFInterst {
  month: string
  interest: string
}

interface PPFContextProps {
  ppfData: {
    ppfList: PPF[]
    ppfDepositList: PPFDeposit[]
    ppfInterestList: PPFInterst[]
    ppfSummary: PPFSummary
  }
  dispatch: any
}

const initialState = {
  ppfData: {
    ppfList: [],
    ppfDepositList: [],
    ppfInterestList: [],
    ppfSummary: {},
  },
  dispatch: () => {},
} as PPFContextProps

const PPFContext = createContext(initialState)

export const PPFProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <PPFContext.Provider value={{ ppfData: state, dispatch: dispatch }}>
      {children}
    </PPFContext.Provider>
  )
}

export const usePPFContext = () => {
  const context = useContext(PPFContext)
  if (!context) {
    throw new Error('useStocksContext must be used within a StocksProvider')
  }
  return context
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PPF':
      return {
        ...state,
        ppfList: action.payload,
      }
    case 'UPDATE_PPF_DEPOSIT':
      return {
        ...state,
        ppfDepositList: action.payload,
      }
    case 'UPDATE_PPF_INTEREST':
      return {
        ...state,
        ppfInterestList: action.payload,
      }
    case 'UPDATE_PPF_SUMMARY':
      return {
        ...state,
        ppfSummary: { ...state.ppfSummary, ...action.payload },
      }
    default:
      return state
  }
}

export default PPFContext
