import React, { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart, ArcElement, Legend, Tooltip } from 'chart.js'
import { useStocksContext } from '../../contexts/stocksContext'
import { useGoldContext } from '../../contexts/goldContext'
import { useMutualFundsContext } from '../../contexts/mutualFundsContext'
import { usePPFContext } from '../../contexts/ppfContext'
import style from './topSummaryBox.module.scss'
import { usePFContext } from '../../contexts/pfContext'
import Carousel from '../../commonComponents/cardCarousel/cardCarousel'
import { useFDContext } from '../../contexts/fdContext'
import { useNPSContext } from '../../contexts/npsContext'

Chart.register(ArcElement, Tooltip, Legend)

interface chartData {
  labels: string[]
  datasets: any[]
}

const getRandomColor = (): string => {
  const letters: string = '0123456789ABCDEF'
  let color: string = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function findColorIndex(pieData, searchItem) {
  let colorIndex = undefined
  pieData.labels.forEach((element, index) => {
    if (element === searchItem) {
      colorIndex = index
    }
  })
  return colorIndex
}

const TopSummaryBox = () => {
  const stockContext = useStocksContext()
  const ppfContext = usePPFContext()
  const goldContext = useGoldContext()
  const mutualFundContext = useMutualFundsContext()
  const [carouselData, setCarousel] = useState([])
  const pfCtx = usePFContext()
  const fdCtx = useFDContext()
  const npsCtx = useNPSContext()
  const [pieData, setPieData] = useState<chartData>({
    labels: [],
    datasets: [],
  })
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalChange, setTotalChange] = useState(0)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const handleResize = () => {
    setWindowWidth(window.innerWidth)
  }
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(
    () => {
      if (ppfContext?.ppfData?.ppfList?.length > 0) {
        calculatePPFContribution()
      }
      if (stockContext?.stocksData?.stocksList?.length > 0) {
        setStocksData()
      }
      if (mutualFundContext?.mutualFundsData?.mfList?.length > 0) {
        setMutualFundsData()
      }
      if (
        goldContext?.goldData?.goldList?.length > 0 &&
        goldContext?.goldData?.goldRateList
      ) {
        // Object.keys(goldContext?.goldData?.goldRateList).length>0
        setGoldData()
      }
      if (pfCtx?.pfData?.pfSummary?.change !== undefined) {
        // Object.keys(goldContext?.goldData?.goldRateList).length>0
        setPfData()
      }
      if (fdCtx?.fdData?.fdList?.length > 0) {
        // Object.keys(goldContext?.goldData?.goldRateList).length>0
        setFDData()
      }
      if (npsCtx?.npsData?.npsList?.length > 0) {
        // Object.keys(goldContext?.goldData?.goldRateList).length>0
        setNPSData()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stockContext, ppfContext, goldContext, mutualFundContext, pfCtx],
  )

  function setData(labelString: string, value: number, totalProfit) {
    if (pieData.labels.includes(labelString) === false) {
      let currentLabels = pieData.labels
      let currentDataset = pieData.datasets
      currentLabels.push(labelString)
      if (pieData?.datasets?.length === 0) {
        currentDataset.push({
          label: 'Total Invested',
          data: [parseInt(value.toFixed())],
          // data:[40],
          backgroundColor: [getRandomColor()],
          hoverBackgroundColor: [getRandomColor()],
        })
      } else {
        // currentDataset[0]?.data.push(60);
        currentDataset[0]?.data.push(parseInt(value.toFixed()))
        currentDataset[0]?.backgroundColor.push(getRandomColor())
        currentDataset[0]?.hoverBackgroundColor.push(getRandomColor())
      }
      setTotalInvested((prev) => prev + value)
      setTotalChange((prev) => prev + totalProfit)
      setPieData((prev) => ({
        ...prev,
        labels: currentLabels,
        datasets: currentDataset,
      }))
    }
  }
  //write functions to calculate total investment in each
  function calculatePPFContribution() {
    const ppfData = ppfContext.ppfData.ppfList
    let totalProfit = 0
    for (let i = 0; i < ppfData.length; i++) {
      totalProfit += ppfData[i]['interest']
    }
    let totalInvested = ppfData[ppfData.length - 1].total - totalProfit
    carouselData.forEach((element) => {
      if (element.itemName === 'PPF') {
      }
    })
    setCarousel((prev) => [
      ...prev,
      {
        itemName: 'PPF',
        change: totalProfit,
        investedAmount: totalInvested,
        total: totalInvested + totalProfit,
        color:
          pieData.datasets[0].backgroundColor[findColorIndex(pieData, 'PPF')],
      },
    ])
    setData('PPF', totalInvested, totalProfit)
  }

  function setStocksData() {
    let totalInvested = 0
    let totalProfit = 0
    stockContext.stocksData.stocksList.forEach((element) => {
      totalInvested += element['quantity'] * element['price']
      totalProfit += element['quantity'] * element['currentPrice']
    })
    totalProfit -= totalInvested
    setCarousel((prev) => [
      ...prev,
      {
        itemName: 'Stocks',
        change: totalProfit,
        investedAmount: totalInvested,
        total: totalInvested + totalProfit,
        color:
          pieData.datasets[0].backgroundColor[
            findColorIndex(pieData, 'Stocks')
          ],
      },
    ])
    setData('Stocks', totalInvested, totalProfit)
  }

  function setMutualFundsData() {
    let totalInvested = 0
    let totalProfit = 0
    mutualFundContext.mutualFundsData.mfList.forEach((element) => {
      totalInvested += element['quantity'] * element['NAV']
      totalProfit += element['quantity'] * element['latestNav']
    })
    totalProfit -= totalInvested
    setCarousel((prev) => [
      ...prev,
      {
        itemName: 'Mutual Funds',
        change: totalProfit,
        investedAmount: totalInvested,
        total: totalInvested + totalProfit,
        color:
          pieData.datasets[0].backgroundColor[
            findColorIndex(pieData, 'Mutual Funds')
          ],
      },
    ])
    setData('Mutual Funds', totalInvested, totalProfit)
  }

  function setGoldData() {
    let totalInvested = 0
    let totalProfit = 0
    goldContext.goldData.goldList.forEach((element) => {
      totalInvested += element['purchaseAmount']
      totalProfit +=
        goldContext.goldData.goldRateList[element['goldType']] *
        element['purchaseQuantity']
    })
    totalProfit -= totalInvested
    setCarousel((prev) => [
      ...prev,
      {
        itemName: 'Gold',
        change: totalProfit,
        investedAmount: totalInvested,
        total: totalInvested + totalProfit,
        color:
          pieData.datasets[0].backgroundColor[findColorIndex(pieData, 'Gold')],
      },
    ])
    setData('Gold', totalInvested, totalProfit)
  }

  function setPfData() {
    setData(
      'Employee Provident Fund',
      pfCtx.pfData.pfSummary.investedAmount,
      pfCtx.pfData.pfSummary.change,
    )
    setCarousel((prev) => [
      ...prev,
      {
        itemName: 'PF',
        change: pfCtx.pfData.pfSummary.change,
        investedAmount: pfCtx.pfData.pfSummary.investedAmount,
        total: pfCtx.pfData.pfSummary.currentAmount,
        color:
          pieData.datasets[0].backgroundColor[
            findColorIndex(pieData, 'Employee Provident Fund')
          ],
      },
    ])
  }

  function setFDData() {
    let change = 0
    let invested = 0
    let total = 0
    fdCtx.fdData.fdList.forEach((el) => {
      invested += el.investedAmount
      total += el.maturityAmount
      change += el.maturityAmount - el.investedAmount
    })
    setData('Fixed Deposit', invested, change)
    setCarousel((prev) => [
      ...prev,
      {
        itemName: 'FD',
        change: change,
        investedAmount: invested,
        total: total,
        color:
          pieData.datasets[0].backgroundColor[
            findColorIndex(pieData, 'Fixed Deposit')
          ],
      },
    ])
  }

  function setNPSData(){
    let totalInvested = 0
    let totalProfit = 0
    npsCtx.npsData.npsList.forEach((element) => {
      totalInvested += element['investedQuant'] * element['investedNav']
      totalProfit += element['investedQuant'] * element['currentNAV']
    })
    totalProfit -= totalInvested
    setCarousel((prev) => [
      ...prev,
      {
        itemName: 'National Pension Scheme',
        change: totalProfit,
        investedAmount: totalInvested,
        total: totalInvested + totalProfit,
        color:
          pieData.datasets[0].backgroundColor[
            findColorIndex(pieData, 'NPS')
          ],
      },
    ])
    setData('National Pension Scheme', totalInvested, totalProfit)
  }

  return (
    <div className={style.topContainer}>
      <div className={style.chartContainer}>
        <Pie
          data={pieData}
          style={{ padding: '10px 10px', backgroundColor: '' }}
          redraw
          key={JSON.stringify(pieData)}
          options={
            windowWidth < 1200
              ? {
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      fullSize: true,
                      labels: {
                        padding: 10,
                        font: { size: 12, weight: '900' },
                      },
                    },
                  },
                }
              : {
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      fullSize: false,
                      labels: { padding: 5, font: { size: 12, weight: '900' } },
                    },
                  },
                }
          }
        />
      </div>
      <div className={style.summaryAndCard}>
        <div className={style.summaryBox}>
          <div className={style.infoContainer}>
            <span>
              {totalInvested.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
              })}
            </span>
            <span className={style.captionContainer}>Total Invested</span>
          </div>
          <div className={style.infoContainer}>
            <span>
              {totalChange.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
              })}
            </span>
            <span className={style.captionContainer}>Total Profit</span>
          </div>
          <div className={style.infoContainer}>
            <span>
              {(totalInvested + totalChange).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
              })}
            </span>
            <span className={style.captionContainer}>Current Value</span>
          </div>
        </div>
        <div className={style.slideShow}>
          <Carousel carouselData={carouselData} />
        </div>
      </div>
    </div>
  )
}

export default TopSummaryBox
