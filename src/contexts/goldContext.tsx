import { createContext, useReducer, useContext } from 'react'

interface GoldDeposit {
  depositID: number
  description: string
  goldType: string
  purchaseAmount: number
  purchaseDate: string
  purchaseQuantity: number
}
interface GoldRates {
  '18': number
  '22': number
  '24': number
  lastUpdated: string
}

interface GoldContextProps {
  goldData: {
    goldList: GoldDeposit[]
    goldRateList: GoldRates
  }
  dispatch: any
}

const initialState = {
  goldData: {
    goldList: [],
    goldRateList: {},
  },
  dispatch: () => {},
} as GoldContextProps

const GoldContext = createContext(initialState)

export const GoldProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <GoldContext.Provider value={{ goldData: state, dispatch: dispatch }}>
      {children}
    </GoldContext.Provider>
  )
}

export const useGoldContext = () => {
  const context = useContext(GoldContext)
  if (!context) {
    throw new Error('useGoldContext must be used within a GoldProvider')
  }
  return context
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_Gold':
      return {
        ...state,
        goldList: action.payload,
      }
    case 'UPDATE_Gold_Rates':
      return {
        ...state,
        goldRateList: action.payload,
      }
    default:
      return state
  }
}

export default GoldContext
