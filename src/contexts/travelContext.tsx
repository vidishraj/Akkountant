import React, { createContext, useReducer, useContext, ReactNode } from 'react'

interface TripResponse {
  tripId: number
  tripTitle: string
}

interface UserResponse {
  tripId: number
  userId: number
  userName: string
}
// Define initial state and action types
interface TravelContextType {
  trip: TripResponse[] | undefined // Specify the type later
  expenses: any // Specify the type later
  users: UserResponse[] // Specify the type later
  balances: any // Specify the type later
  chosenTrip: TripResponse | undefined
  summary: CurrentTripInterface | undefined
}

interface CurrentTripInterface {
  userCount: number | undefined
}

const initialState: TravelContextType = {
  trip: undefined,
  expenses: [],
  users: [],
  balances: [],
  chosenTrip: undefined,
  summary: { userCount: undefined },
}

// Define actions
type Action =
  | { type: 'SET_TRIP'; payload: any }
  | { type: 'SET_EXPENSES'; payload: any[] }
  | { type: 'SET_USERS'; payload: any[] }
  | { type: 'SET_BALANCES'; payload: any[] }
  | { type: 'SET_CHOSEN_TRIP'; payload: TripResponse }
  | { type: 'SET_SUMMARY'; payload: CurrentTripInterface }

// Reducer to handle state changes
const reducer = (
  state: TravelContextType,
  action: Action,
): TravelContextType => {
  switch (action.type) {
    case 'SET_TRIP':
      return { ...state, trip: action.payload }
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload }
    case 'SET_USERS':
      return { ...state, users: action.payload }
    case 'SET_BALANCES':
      return { ...state, balances: action.payload }
    case 'SET_CHOSEN_TRIP':
      return { ...state, chosenTrip: action.payload }
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload }
    default:
      return state
  }
}

// Create context
const TravelContext = createContext<{
  state: TravelContextType
  dispatch: React.Dispatch<Action>
}>({
  state: initialState,
  dispatch: () => undefined,
})

// Provider component
export const TravelProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <TravelContext.Provider value={{ state, dispatch }}>
      {children}
    </TravelContext.Provider>
  )
}

// Custom hook to use context
export const useTravel = () => {
  const context = useContext(TravelContext)
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider')
  }
  return context
}
