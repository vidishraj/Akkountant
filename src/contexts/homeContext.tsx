//Which card has been selected.

import { createContext } from 'react'

export interface HomeContextInterface {
  homeStates: {
    selectedId: number
  }
  setHomeState: any
}

export const HomeContext = createContext<HomeContextInterface>({
  homeStates: {
    selectedId: -1,
  },
  setHomeState: () => {},
})
