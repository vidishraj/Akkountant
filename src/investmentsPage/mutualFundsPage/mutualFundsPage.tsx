import React from 'react'
import style from './mutualFundsPage.module.scss'
import mfList from './mutualFundsList.json'
import MutualFundsListBox from './mutualFundsListsBox/mutualFundsListsBox'
import MutualFundsSummaryBox from './mutualFundsSummary/mutualFundsSummary'
import MutualFundsInfoBox from './mutualFundsInfoBox/mutualFundsInfoBox'
import RefreshIconBlack from '../../commonComponents/icons/refreshIconBlack'
import { useLoader } from '../../contexts/loaderContext'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import {
  fetchMutualFunds,
  fetchMutualFundsWithCode,
  refreshMutualFunds,
} from '../../api/investmentsAPI.tsx/mutualFundsAPI'
import { useMutualFundsContext } from '../../contexts/mutualFundsContext'
import MutualFundsLoaderLottie from '../../commonComponents/lottieAnimations/mutualFundsLoaderAnimation'

interface MutualFundsPageProps {}

const MutualFundsPage: React.FC<MutualFundsPageProps> = () => {
  const { status, setStatus } = useLoader()
  const { mutualFundsData, dispatch } = useMutualFundsContext()

  function handleSuggestionClick(suggestion) {
    let body = new FormData()
    setStatus((prev) => ({
      ...prev,
      mfBoxStatus: true,
    }))
    body.append('schemeCode', suggestion['symbol'])
    fetchMutualFundsWithCode(body)
      .then((response) => {
        dispatch({
          type: 'UPDATE_MF_INFO',
          payload: response.data.Message,
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          mfBoxStatus: false,
        }))
      })
  }

  function handleRefresh() {
    setStatus((prev) => ({
      ...prev,
      mfBoxStatus: true,
    }))
    refreshMutualFunds()
      .then(() => {
        fetchMutualFunds(true).then((response) => {
          dispatch({
            type: 'UPDATE_MF_LIST',
            payload: response.data.Message,
          })
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          mfBoxStatus: false,
        }))
      })
  }

  const formatResult = (item) => {
    return (
      <>
        <span style={{ display: 'block', textAlign: 'left' }}>{item.name}</span>
      </>
    )
  }

  return (
    <div className={style.stocksPage}>
      {status.mfBoxStatus ? (
        <MutualFundsLoaderLottie style={{ height: '90vh', width: '100vw' }} />
      ) : (
        <>
          <div className={style.search}>
            <ReactSearchAutocomplete
              items={mfList}
              className={style.searchBar}
              fuseOptions={{ keys: ['name', 'symbol'] }}
              resultStringKeyName='name'
              onSelect={handleSuggestionClick}
              formatResult={formatResult}
            />
            <div className={style.buttonContainer}>
              <button
                onClick={() => handleRefresh()}
                className={style.refreshButton}
                disabled={false}
              >
                <RefreshIconBlack width={20} height={20} />
              </button>
              <span className={style.lastUpdatedSpan}>
                {' '}
                {mutualFundsData?.mfList[0]?.['lastUpdated']
                  ? convertLastUpdatedDate(
                      mutualFundsData?.mfList[0]?.['lastUpdated'],
                    )
                  : ''}{' '}
              </span>
              <span className={style.lastUpdatedSpanUnder}> Last Updated</span>
            </div>
          </div>
          <div className={style.stockInfoContainer}>
            <div className={style.leftContainer}>
              <MutualFundsListBox />
            </div>
            <div className={style.rightContainer}>
              <MutualFundsSummaryBox />
              <MutualFundsInfoBox />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MutualFundsPage

export function convertLastUpdatedDate(dateString) {
  const [datePart, timePart] = dateString.split(' ')
  const [day, month, year] = datePart.split('/')
  let [hour, minute] = timePart.split(':')
  hour = parseInt(hour)
  minute = parseInt(minute)
  if (minute > 29) {
    hour += 6
    minute = (minute + 30) % 60
  } else {
    hour += 5
    minute += 30
  }
  // Constructing the Date object with correct month order (month - 1 because months are zero-based)
  const originalDate = new Date(year, month - 1, day, hour, minute)

  // Formatting the date to a readable format
  const formattedDate = originalDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })

  return formattedDate
}
