import React from 'react'
import style from './npsPage.module.scss'
import npsList from './npsList.json'
import RefreshIconBlack from '../../commonComponents/icons/refreshIconBlack'
import { useLoader } from '../../contexts/loaderContext'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { useNPSContext } from '../../contexts/npsContext'
import NpsListBox from './npsListBox/npsListBox'
import NPSSummaryBox from './npsSummaryBox/npsSummaryBox'
import NPSInfoBox from './npsInfoBox/npsInfoBox'
import { fetchNPS, fetchNPSWithCode, refreshNPS } from '../../api/investmentsAPI.tsx/npsAPi'
import { useMessage } from '../../contexts/messageContext'
import NpsLoaderAnimation from '../../commonComponents/lottieAnimations/npsLoaderAnimation'

interface NPSPageProps {}

const NPSPage: React.FC<NPSPageProps> = () => {
  const { status, setStatus } = useLoader()
  const { npsData, dispatch } = useNPSContext()
  const {setPayload} = useMessage()
  function handleSuggestionClick(suggestion) {
    let body = new FormData()
    setStatus((prev) => ({
      ...prev,
      npsBoxStatus: true,
    }))
    body.append('schemeCode', suggestion['pensionSchemeID'])
    body.append('fmCode', suggestion['fmCode'])
    fetchNPSWithCode(body)
      .then((response) => {
        let preparedMessage = {
          currentNAV: response.data.Message[1],
          fmCode: suggestion['fmCode'],
          fmName: response.data.Message[0]['PFM Name'],
          inceptionDate: response.data.Message[0]['Inception Date'],
          investedNav: 0,
          investedQuant: 0,
          schemeCode: suggestion['pensionSchemeID'],
          schemeName: response.data.Message[0]['Scheme Name'],
          topHoldings: response.data.Message[0]['Top 5 Holdings'],
          topSectors: response.data.Message[0]['Top 3 Sectors'],
          yearHigh: response.data.Message[0]['52 week High'],
          yearLow: response.data.Message[0]['52 Week Low'],
          purchased: false
        }
        dispatch({
          type: 'UPDATE_NPS_INFO',
          payload: preparedMessage,
        })
      }).catch((error)=>{
        console.log(error)
        setPayload({
          message: 'NPS info unavailable. Might be discontinued.',
          type: 'error',
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          npsBoxStatus: false,
        }))
      })
  }

  function handleRefresh() {
    setStatus((prev) => ({
      ...prev,
      npsBoxStatus: true,
    }))
    refreshNPS()
      .then(() => {
        fetchNPS(true).then((response) => {
          dispatch({
            type: 'UPDATE_NPS_LIST',
            payload: response.data.Message,
          })
        })
      })
      .finally(() => {
        setStatus((prev) => ({
          ...prev,
          npsBoxStatus: false,
        }))
      })
  }

  const formatResult = (item) => {
    return (
      <>
        <span style={{ display: 'block', textAlign: 'left' }}>{item.schemeName}</span>
      </>
    )
  }

  return (
    <div className={style.npsPage}>
      {status.npsBoxStatus ? (
        <NpsLoaderAnimation style={{ height: '90vh', width: '100vw' }} />
      ) : (
        <>
          <div className={style.search}>
            <ReactSearchAutocomplete
              items={npsList}
              className={style.searchBar}
              fuseOptions={{ keys: ['schemeName'], isCaseSensitive:false}}
              resultStringKeyName='schemeName'
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
                {npsData?.npsList[0]?.['lastUpdated']
                  ? convertLastUpdatedDate(
                      npsData?.npsList[0]?.['lastUpdated'],
                    )
                  : ''}{' '}
              </span>
              <span className={style.lastUpdatedSpanUnder}> Last Updated</span>
            </div>
          </div>
          <div className={style.stockInfoContainer}>
            <div className={style.leftContainer}>
              <NpsListBox />
            </div>
            <div className={style.rightContainer}>
              <NPSSummaryBox />
              <NPSInfoBox />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NPSPage

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
