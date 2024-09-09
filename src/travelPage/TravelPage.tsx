import { fetchTrips, fetchUsersForATrip } from '../api/travelAPI'
import DarkModeLoader from '../commonComponents/basicLoader/basicLoader'
import Header from '../commonComponents/header/header'
import { useLoader } from '../contexts/loaderContext'
import { useMessage } from '../contexts/messageContext'
import { useTravel } from '../contexts/travelContext'
import ExpenseDialog from './ExpenseDialog'
import ActionPage from './SummaryPage'
import TripPage from './TripPage'
import { useEffect } from 'react'
export const TravelPage = () => {
  //Custom header later. Placeholder for now. Block the rest of the routes.
  //Pick Trip on arrival. Fetch this on load. The only thing fetched initially.
  const loader = useLoader()
  const notif = useMessage()
  const travelCtx = useTravel()

  function refreshData() {
    fetchUsersForATrip(true, travelCtx.state.chosenTrip.tripId).then(
      (response) => {
        console.log(response)
        const users = response.data.Message
        travelCtx.dispatch({
          type: 'SET_USERS',
          payload: users,
        })
        travelCtx.dispatch({
          type: 'SET_SUMMARY',
          payload: {
            ...travelCtx.state.summary,
            userCount: Object.keys(users).length,
          },
        })
      },
    )
  }
  useEffect(() => {
    if (travelCtx.state.chosenTrip) {
      refreshData()
      //Here we will fetch the users, expense and balances for a trip.
      //Since we have infinite scroll, we can fetch count of expenses and the first 10 expenses and then increment page.
    }
  }, [travelCtx.state.chosenTrip])
  useEffect(() => {
    fetchTrips(true)
      .then((response) => {
        travelCtx.dispatch({
          type: 'SET_TRIP',
          payload: response.data.Message,
        })
        console.log(response.data.Message)
      })
      .catch(() => {})
      .finally(() => {})
  }, [])
  return (
    <>
      {/* <DarkModeLoader status={loader.status.travelPageStatus}></DarkModeLoader> */}
      <div>
        <Header navigater={navigator} />
        {travelCtx.state.chosenTrip === undefined && <TripPage></TripPage>}
        {travelCtx.state.chosenTrip !== undefined && (
          <>
            <ActionPage refreshData={refreshData}></ActionPage>
          </>
        )}
      </div>
    </>
  )
}
