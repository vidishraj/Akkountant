import { createContext, useReducer, useContext } from 'react'
import { StockResponse } from '../api/investmentsAPI.tsx/stocksAPI'

interface StocksContextProps {
  stocksData: {
    stocksList: Object[]
    stocksInfo: StockResponse
    stocksSummary: any
    stocksTransactions: any
    suggestionsDropDown: boolean
  }
  dispatch: any
}

const initialState = {
  stocksData: {
    stocksList: [],
    stocksInfo: {},
    stocksSummary: {},
    stocksTransactions: {},
    suggestionsDropDown: false,
  },
  dispatch: () => {},
} as StocksContextProps

const StocksContext = createContext(initialState)

export const StocksProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <StocksContext.Provider value={{ stocksData: state, dispatch: dispatch }}>
      {children}
    </StocksContext.Provider>
  )
}

export const useStocksContext = () => {
  const context = useContext(StocksContext)
  if (!context) {
    throw new Error('useStocksContext must be used within a StocksProvider')
  }
  return context
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_STOCKS_LIST':
      return {
        ...state,
        stocksList: action.payload,
      }
    case 'UPDATE_STOCKS_INFO':
      return {
        ...state,
        stocksInfo: action.payload,
      }
    case 'UPDATE_STOCKS_SUMMARY':
      return {
        ...state,
        stocksSummary: action.payload,
      }
    case 'UPDATE_SUGGESTIONS_DROPDOWN':
      return {
        ...state,
        suggestionsDropDown: action.payload,
      }
    case 'UPDATE_STOCKS_TRANSACTIONS':
      return {
        ...state,
        stocksTransactions: action.payload,
      }
    default:
      return state
  }
}

export default StocksContext
