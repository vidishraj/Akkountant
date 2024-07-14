import React, { createContext, useReducer, useContext } from 'react'

interface FundDetails {
  fundHouse: string
  lastUpdated: string
  latestNav: string
  schemeCode: string
  schemeName: string
  schemeStartDate: string
  schemeStartNav: string
  schemeType: string
  purchased?: boolean
  NAV?: any
  quantity?: any
}

interface MutualFundsContextProps {
  mutualFundsData: {
    mfList: Object[]
    mfInfo: FundDetails
    mfSummary: any
    mfTransactions: any
    suggestionsDropDown: boolean
  }
  dispatch: any
}

const initialState = {
  mutualFundsData: {
    mfList: [],
    mfInfo: {},
    mfSummary: {},
    mfTransactions: {},
    suggestionsDropDown: false,
  },
  dispatch: () => {},
} as MutualFundsContextProps

const MutualFundsContext = createContext(initialState)

export const MutualFundsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <MutualFundsContext.Provider
      value={{ mutualFundsData: state, dispatch: dispatch }}
    >
      {children}
    </MutualFundsContext.Provider>
  )
}

export const useMutualFundsContext = () => {
  const context = useContext(MutualFundsContext)
  if (!context) {
    throw new Error('useStocksContext must be used within a StocksProvider')
  }
  return context
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_MF_LIST':
      return {
        ...state,
        mfList: action.payload,
      }
    case 'UPDATE_MF_INFO':
      return {
        ...state,
        mfInfo: action.payload,
      }
    case 'UPDATE_MF_SUMMARY':
      return {
        ...state,
        mfSummary: action.payload,
      }
    case 'UPDATE_MF_DROPDOWN':
      return {
        ...state,
        suggestionsDropDown: action.payload,
      }
    case 'UPDATE_MF_TRANSACTIONS':
      return {
        ...state,
        mfTransactions: action.payload,
      }
    default:
      return state
  }
}

export default MutualFundsContext
