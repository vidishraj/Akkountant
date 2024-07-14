import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchFD } from '../api/investmentsAPI.tsx/fdAPI'
import { fetchGold, fetchGoldRates } from '../api/investmentsAPI.tsx/goldAPI'
import {
  fetchMutualFunds,
  fetchMutualFundsTransactions,
} from '../api/investmentsAPI.tsx/mutualFundsAPI'
import { fetchNPS, fetchNPSTransactions } from '../api/investmentsAPI.tsx/npsAPi'
import {
  fetchPF,
  fetchPFInterest,
  fetchPFInterestRates,
} from '../api/investmentsAPI.tsx/pfAPI'
import {
  fetchPPF,
  fetchPPFDeposit,
  fetchPPFInterest,
} from '../api/investmentsAPI.tsx/ppfAPI'
import {
  fetchMarketStatus,
  fetchStocks,
  fetchStocksTransactions,
} from '../api/investmentsAPI.tsx/stocksAPI'
import CollapsibleDiv from '../commonComponents/collapsableDiv/collapsableDiv'
import Header from '../commonComponents/header/header'
import { useFDContext } from '../contexts/fdContext'
import { useGoldContext } from '../contexts/goldContext'
import { useMessage } from '../contexts/messageContext'
import { useMutualFundsContext } from '../contexts/mutualFundsContext'
import { useNPSContext } from '../contexts/npsContext'
import { usePFContext } from '../contexts/pfContext'
import { PPF, PPFDeposit, usePPFContext } from '../contexts/ppfContext'
import { useStocksContext } from '../contexts/stocksContext'
import FDPage from './fdPage/fdPage'
import GoldInvestments from './goldPage/goldPage'
import style from './investmentsPage.module.scss'
import MutualFundsPage from './mutualFundsPage/mutualFundsPage'
import NPSPage from './npsPage/npsPage'
import PFPage from './pfPage/pfPage'
import { setPFSummary } from './pfPage/pfSummaryBox/pfSummaryBox'
import PPFPage from './ppfPage/ppfPage'
import StocksPage from './stocksPage/stocksPage'
import TopSummaryBox from './topSummaryBox/topSummaryBox'

const InvestmentsPage: React.FC = () => {
  const navigator = useNavigate()
  const { stocksData, dispatch } = useStocksContext()
  const mfCtx = useMutualFundsContext()
  const ppfCtx = usePPFContext()
  const goldCtx = useGoldContext()
  const pfCtx = usePFContext()
  const fdCtx = useFDContext()
  const npsCtx = useNPSContext()
  const { setPayload } = useMessage()

  async function fetchPFData() {
    await fetchPF(true).then((response) => {
      pfCtx.dispatch({
        type: 'UPDATE_PF',
        payload: response.data.Message,
      })
    })

    await fetchPFInterest(true).then((response) => {
      pfCtx.dispatch({
        type: 'UPDATE_PF_INTEREST',
        payload: response.data.Message,
      })
    })

    await fetchPFInterestRates(true).then((response) => {
      pfCtx.dispatch({
        type: 'UPDATE_PF_INTERESTRATES',
        payload: response.data.Message,
      })
    })
  }

  async function fetchGoldData() {
    await fetchGold(true)
      .then((response) => {
        goldCtx.dispatch({
          type: 'UPDATE_Gold',
          payload: response.data.Message,
        })
      })
      .catch(() => {
        setPayload({
          message: 'Db might be down. Please refresh after 5 mins',
          type: 'error',
        })
      })

    await fetchGoldRates(true).then((response) => {
      goldCtx.dispatch({
        type: 'UPDATE_Gold_Rates',
        payload: response.data.Message,
      })
    })
  }

  async function fetchStocksData() {
    await fetchStocks(false).then((response) => {
      dispatch({
        type: 'UPDATE_STOCKS_LIST',
        payload: response.data.Message,
      })
    })
    await fetchStocksTransactions().then((response) => {
      dispatch({
        type: 'UPDATE_STOCKS_TRANSACTIONS',
        payload: response.data.Message,
      })
    })
    await fetchMarketStatus().then((response) => {
      let status =
        response.data.Message['Market Status'] === 'Open' ? true : false
      dispatch({
        type: 'UPDATE_STOCKS_SUMMARY',
        payload: { ...stocksData.stocksSummary, marketStatus: status },
      })
    })
  }

  async function fetchMutualFundsData() {
    await fetchMutualFunds(false).then((response) => {
      mfCtx.dispatch({
        type: 'UPDATE_MF_LIST',
        payload: response.data.Message,
      })
    })
    await fetchMutualFundsTransactions().then((response) => {
      mfCtx.dispatch({
        type: 'UPDATE_MF_TRANSACTIONS',
        payload: response.data.Message,
      })
    })
  }

  async function fetchPPFData() {
    await fetchPPF(false).then((response) => {
      ppfCtx.dispatch({
        type: 'UPDATE_PPF',
        payload: response.data.Message,
      })

      let change = 0
      let current = 0
      response.data.Message.map((element: PPF) => {
        change += element.interest
        return null
      })
      current = response.data.Message[response.data.Message.length - 1].total
      ppfCtx.dispatch({
        type: 'UPDATE_PPF_SUMMARY',
        payload: {
          change: change,
          currentAmount: current,
        },
      })
    })
    await fetchPPFDeposit(false).then((response) => {
      ppfCtx.dispatch({
        type: 'UPDATE_PPF_DEPOSIT',
        payload: response.data.Message,
      })
      let investmentCount = 0
      let investedAmount = 0
      response.data.Message.map((element: PPFDeposit) => {
        investedAmount += element.amount
        investmentCount += 1
        return null
      })

      let difference = calculateYearsWithDecimals(
        response.data.Message[0]?.depositDate,
      )?.toFixed(2)
      ppfCtx.dispatch({
        type: 'UPDATE_PPF_SUMMARY',
        payload: {
          investedAmount: investedAmount,
          investmentCount: investmentCount,
          duration: difference,
        },
      })
    })
    await fetchPPFInterest(false).then((response) => {
      ppfCtx.dispatch({
        type: 'UPDATE_PPF_INTEREST',
        payload: response.data.Message,
      })
    })
  }

  async function fetchFDData() {
    fetchFD(true).then((response) => {
      fdCtx.dispatch({
        type: 'UPDATE_FD',
        payload: response.data.Message,
      })
    })
  }
  
  async function fetchNPSData() {
    await fetchNPS(false).then((response) => {
      npsCtx.dispatch({
        type: 'UPDATE_NPS_LIST',
        payload: response.data.Message,
      })
    }).catch(()=>{
      npsCtx.dispatch({
        type: 'UPDATE_NPS_LIST',
        payload: undefined,
      })
    })
    await fetchNPSTransactions().then((response) => {
      npsCtx.dispatch({
        type: 'UPDATE_NPS_TRANSACTIONS',
        payload: response.data.Message,
      })
    })
  }
  useEffect(() => {
    fetchGoldData()
    fetchStocksData()
    fetchMutualFundsData()
    fetchPPFData()
    fetchPFData()
    fetchFDData()
    fetchNPSData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (
      pfCtx?.pfData?.pfSummary === undefined &&
      pfCtx?.pfData?.pfInterest?.length > 0 &&
      pfCtx?.pfData?.pfList?.length > 0
    ) {
      setPFSummary(pfCtx.pfData.pfList, pfCtx.pfData.pfInterest, pfCtx.dispatch)
    }
  }, [pfCtx])

  return (
    <>
      <Header navigater={navigator} />
      <TopSummaryBox />
      <div className={style.investmentsPage}>
        <CollapsibleDiv
          title='Stocks'
          body={<StocksPage />}
          style={{
            background: '#f5f5f5',
            border: '1px solid #ccc',
            padding: '0px 10px',
          }}
          onClickHandler={() => {}}
          height='15vh'
          dataList={stocksData.stocksList}
        />
        <CollapsibleDiv
          title='Gold'
          body={<GoldInvestments />}
          style={{
            background: '#f5f5f5',
            border: '1px solid #ccc',
            padding: '0px 10px',
          }}
          onClickHandler={() => {}}
          height='15vh'
          dataList={goldCtx.goldData.goldList}
        />
        <CollapsibleDiv
          title='Mutual Funds'
          body={<MutualFundsPage />}
          style={{
            background: '#f5f5f5',
            border: '1px solid #ccc',
            padding: '0px 10px',
          }}
          onClickHandler={() => {}}
          height='15vh'
          dataList={mfCtx.mutualFundsData.mfList}
        />
        <CollapsibleDiv
          title='National Pension Scheme'
          body={<NPSPage />}
          style={{
            background: '#f5f5f5',
            border: '1px solid #ccc',
            padding: '0px 10px',
          }}
          onClickHandler={() => {}}
          height='15vh'
          dataList={npsCtx.npsData.npsList}
        />
        <CollapsibleDiv
          title='Public Provident Fund'
          body={<PPFPage />}
          style={{
            background: '#f5f5f5',
            border: '1px solid #ccc',
            padding: '0px 10px',
          }}
          onClickHandler={() => {}}
          height='15vh'
          dataList={ppfCtx.ppfData.ppfList}
        />
        <CollapsibleDiv
          title='Employee Provident Fund'
          body={<PFPage />}
          style={{
            background: '#f5f5f5',
            border: '1px solid #ccc',
            padding: '0px 10px',
          }}
          onClickHandler={() => {}}
          height='15vh'
          dataList={pfCtx.pfData.pfList}
        />
        <CollapsibleDiv
          title='Fixed Deposits'
          body={<FDPage />}
          style={{
            background: '#f5f5f5',
            border: '1px solid #ccc',
            padding: '0px 10px',
          }}
          onClickHandler={() => {}}
          height='15vh'
          dataList={fdCtx.fdData.fdList}
        />
      </div>
    </>
  )
}

export const calculateYearsWithDecimals = (dateString: string): number => {
  const [day, month, year] = dateString.split('/')
  const providedDate = new Date(Number(year), Number(month) - 1, Number(day))
  const currentDate = new Date()
  const yearsDifference = currentDate.getFullYear() - providedDate.getFullYear()
  const monthsDifference = currentDate.getMonth() - providedDate.getMonth()
  const decimalYears = yearsDifference + monthsDifference / 12
  return decimalYears
}

export default InvestmentsPage
