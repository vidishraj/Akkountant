import React, { createContext, useReducer, useContext } from 'react'

export interface PensionSchemeData {
  currentNAV: number;
  fmCode: string;
  fmName: string;
  inceptionDate: string;
  investedAmount: number;
  investedNav: number;
  investedQuant: number;
  schemeCode: string;
  schemeName: string;
  topHoldings: string;
  topSectors: string;
  yearHigh: number;
  yearLow: number;
  purchased?: boolean
}


interface NPSContextProps {
  npsData: {
    npsList: PensionSchemeData[]
    npsInfo: PensionSchemeData
    npsSummary: any
    npsTransactions: any
    suggestionsDropDown: boolean
  }
  dispatch: any
}

const initialState = {
  npsData: {
    npsList: [],
    npsInfo: {},
    npsSummary: {},
    npsTransactions: {},
    suggestionsDropDown: false,
  },
  dispatch: () => {},
} as NPSContextProps

const NPSContext = createContext(initialState)

export const NPSProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <NPSContext.Provider
      value={{ npsData: state, dispatch: dispatch }}
    >
      {children}
    </NPSContext.Provider>
  )
}

export const useNPSContext = () => {
  const context = useContext(NPSContext)
  if (!context) {
    throw new Error('useNPSContext must be used within a StocksProvider')
  }
  return context
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_NPS_LIST':
      return {
        ...state,
        npsList: action.payload,
      }
    case 'UPDATE_NPS_INFO':
      return {
        ...state,
        npsInfo: action.payload,
      }
    case 'UPDATE_NPS_SUMMARY':
      return {
        ...state,
        npsSummary: action.payload,
      }
    case 'UPDATE_NPS_DROPDOWN':
      return {
        ...state,
        suggestionsDropDown: action.payload,
      }
    case 'UPDATE_NPS_TRANSACTIONS':
      return {
        ...state,
        npsTransactions: action.payload,
      }
    default:
      return state
  }
}

export default NPSContext
