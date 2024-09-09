import NotificationMessage from './commonComponents/messagesBanner/MessageBanner'
import Login from './loginPage/loginPage' //page
import HomePage from './homePage/homePage' //page
import TransactionsPage from './transactionsPage/transactionPage' //page
import { RouterProvider } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { ComingSoon } from './commonComponents/comingSoon/comingSoon'
import InvestmentsPage from './investmentsPage/investmentsPage' //page
import { StocksProvider } from './contexts/stocksContext'
import { MutualFundsProvider } from './contexts/mutualFundsContext'
import { PPFProvider } from './contexts/ppfContext'
import { GoldProvider } from './contexts/goldContext'
import { PFProvider } from './contexts/pfContext'
import { FDProvider } from './contexts/fdContext'
import { NPSProvider } from './contexts/npsContext'
import { TravelPage } from './travelPage/TravelPage'
import { TravelProvider } from './contexts/travelContext'

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Login />,
    },
    {
      path: '/home',
      element: <HomePage />,
    },
    {
      path: '/transactions',
      element: <TransactionsPage />,
    },
    {
      path: '/investments',
      element: <InvestmentsPage />,
    },
    {
      path: '/comingSoon',
      element: <ComingSoon />,
    },
    {
      path: '/travel',
      element: <TravelPage />,
    },
  ])
  return (
    <NotificationMessage>
      <StocksProvider>
        <MutualFundsProvider>
          <PPFProvider>
            <GoldProvider>
              <PFProvider>
                <FDProvider>
                  <NPSProvider>
                    <TravelProvider>
                      <RouterProvider router={router}></RouterProvider>
                    </TravelProvider>
                  </NPSProvider>
                </FDProvider>
              </PFProvider>
            </GoldProvider>
          </PPFProvider>
        </MutualFundsProvider>
      </StocksProvider>
    </NotificationMessage>
  )
}

export default App
