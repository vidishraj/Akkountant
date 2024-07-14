import React, { createContext, useReducer, useContext } from 'react'

export interface PF {
  EPFWage: number
  empShare: number
  emplyrShare: number
  total: number
  wageMonth: string
}

interface PFSummary {
  investedAmount: any
  change: any
  currentAmount: any
  investmentCount: number
  duration: string
}

interface PFInterest {
  month: string
  interest: string
}

interface PFContextProps {
  pfData: {
    pfList: PF[]
    pfInterestList: PFInterest[]
    pfInterest: PFInterest[]
    pfSummary: PFSummary
  }
  dispatch: any
}

const initialState = {
  pfData: {
    pfList: [],
    pfInterestList: [],
    pfInterest: [],
    pfSummary: {},
  },
  dispatch: () => {},
} as PFContextProps

const PFContext = createContext(initialState)

export const PFProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <PFContext.Provider value={{ pfData: state, dispatch: dispatch }}>
      {children}
    </PFContext.Provider>
  )
}

export const usePFContext = () => {
  const context = useContext(PFContext)
  if (!context) {
    throw new Error('usePfContext must be used within a PfContext')
  }
  return context
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PF':
      return {
        ...state,
        pfList: action.payload,
      }
    case 'ADD_PF':
      let oldList = []
      if (state.pfList) {
        oldList = state.pfList
      }
      return {
        ...state,
        pfList: [...oldList, ...action.payload],
      }
    case 'CLEAR_PF':
      return {
        ...state,
        pfList: [],
      }
    case 'UPDATE_PF_INTEREST':
      return {
        ...state,
        pfInterest: action.payload,
      }
    case 'UPDATE_PF_INTERESTRATES':
      return {
        ...state,
        pfInterestList: action.payload,
      }
    case 'UPDATE_PF_SUMMARY':
      return {
        ...state,
        pfSummary: { ...state.pfSummary, ...action.payload },
      }
    default:
      return state
  }
}

export default PFContext
