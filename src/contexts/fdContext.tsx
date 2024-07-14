import React, { createContext, useReducer, useContext } from 'react'
import { FDBoxProps } from '../investmentsPage/fdPage/fdSummary/fdSummary'

interface FDDeposit {
  compoundTenure: number
  depositID: number
  interestRate: number
  investedAmount: number
  investmentBank: string
  investmentDate: string
  investmentDuration: number
  maturityAmount: number
}

interface FDContextProps {
  fdData: {
    fdList: FDDeposit[]
    fdSummary: FDBoxProps[]
  }
  dispatch: any
}

const initialState = {
  fdData: {
    fdList: [],
    fdSummary: [],
  },
  dispatch: () => {},
} as FDContextProps

const FDContext = createContext(initialState)

export const FDProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <FDContext.Provider value={{ fdData: state, dispatch: dispatch }}>
      {children}
    </FDContext.Provider>
  )
}

export const useFDContext = () => {
  const context = useContext(FDContext)
  if (!context) {
    throw new Error('useFDContext must be used within a FDProvider')
  }
  return context
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FD':
      return {
        ...state,
        fdList: action.payload,
      }
    case 'UPDATE_FD_SUMMARY':
      return {
        ...state,
        fdSummary: action.payload,
      }
    default:
      return state
  }
}

export default FDContext
