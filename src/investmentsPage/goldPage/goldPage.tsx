// GoldInvestments.jsx

import React, { useState } from 'react'
import { Button } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RefreshIcon from '@mui/icons-material/Refresh'
import style from './goldPage.module.scss'
import { Carousel } from './carousel/carousel'
import SummaryBox from './summaryBox/summaryBox'
import GoldBricksLottie from '../../commonComponents/lottieAnimations/goldBricksAnimation'
import GoldCoinLottie from '../../commonComponents/lottieAnimations/goldCoinAnimation'
import {
  fetchGold,
  fetchGoldRates,
  insertGoldDeposit,
  recalibrateGoldRates,
} from '../../api/investmentsAPI.tsx/goldAPI'
import { useGoldContext } from '../../contexts/goldContext'
import { useLoader } from '../../contexts/loaderContext'
import GoldRainingLottie from '../../commonComponents/lottieAnimations/goldRainingAnimation'
import BarChartIcon from '@mui/icons-material/BarChart'
import { FormDialog } from './addInvestmentPopUp/formDialog'
import GoldRateDisplay from './rateDisplayChart/rateDisplay'

const GoldInvestments = () => {
  let investedAmount = 0
  let currentAmount = 0
  let totalQuant = 0
  const { goldData } = useGoldContext()
  const loader = useLoader()
  goldData?.goldList?.forEach((deposit) => {
    investedAmount += deposit.purchaseAmount
    currentAmount +=
      goldData.goldRateList[deposit.goldType] * deposit.purchaseQuantity
    totalQuant += deposit.purchaseQuantity
  })

  let change = currentAmount - investedAmount

  let summaryData = {
    investedAmount: investedAmount.toFixed(2),
    currentAmount: currentAmount.toFixed(2),
    change: change.toFixed(2),
    changePercent: ((change / investedAmount) * 100).toFixed(2),
    investmentCount: goldData.goldList.length.toString(),
    totalQuant: totalQuant.toFixed(2),
  }

  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }
  const goldCtx = useGoldContext()

  function handleSubmit(
    selectedDate,
    description,
    goldType: string,
    amount,
    weight,
  ) {
    setOpen(false)
    loader.setStatus((prev) => ({
      ...prev,
      goldBoxStatus: true,
    }))
    const parts = selectedDate.split('-')
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
    let request = {
      purchaseDate: formattedDate,
      itemDesc: description,
      goldType: goldType.replace('K', ''),
      amount: parseFloat(amount),
      quantity: parseFloat(weight),
    }
    insertGoldDeposit(request)
      .then((response) => {})
      .finally(
        loader.setStatus((prev) => ({
          ...prev,
          goldBoxStatus: false,
        })),
      )
  }

  function refreshData() {
    loader.setStatus((prev) => ({
      ...prev,
      goldBoxStatus: true,
    }))
    fetchGold(true)
      .then((response) => {
        goldCtx.dispatch({
          type: 'UPDATE_Gold',
          payload: response.data.Message,
        })
      })
      .finally(() =>
        loader.setStatus((prev) => ({
          ...prev,
          goldBoxStatus: false,
        })),
      )
  }

  function refreshRates() {
    loader.setStatus((prev) => ({
      ...prev,
      goldBoxStatus: true,
    }))
    recalibrateGoldRates()
      .then(() => {
        setTimeout(() => {
          fetchGold(true)
            .then((response) => {
              goldCtx.dispatch({
                type: 'UPDATE_Gold',
                payload: response.data.Message,
              })
            })
            .finally(
              loader.setStatus((prev) => ({
                ...prev,
                goldBoxStatus: false,
              })),
            )
        }, 700)
        setTimeout(() => {
          fetchGoldRates(true).then((response) => {
            goldCtx.dispatch({
              type: 'UPDATE_Gold_Rates',
              payload: response.data.Message,
            })
          })
        }, 500)
      })
      .catch(() => {
        loader.setStatus((prev) => ({
          ...prev,
          goldBoxStatus: false,
        }))
      })
  }
  const [displayRates, setDisplayRates] = useState<boolean>(false)
  return (
    <div className={style.goldPage}>
      {loader.status.goldBoxStatus ? (
        <GoldRainingLottie style={{ height: '90vh', width: '100vw' }} />
      ) : (
        <>
          <FormDialog
            open={open}
            handleSubmit={handleSubmit}
            handleClose={handleClose}
          />
          <SummaryBox {...summaryData} />
          <div className={style.carBox}>
            <GoldBricksLottie
              style={{ flexBasis: '15%', alignSelf: 'center' }}
            />
            <Carousel />
            <GoldCoinLottie style={{ flexBasis: '15%', alignSelf: 'center' }} />
          </div>
          <GoldRateDisplay
            display={displayRates}
            setDisplay={setDisplayRates}
          />
          <div className={style.buttonContainer}>
            <Button
              onClick={handleClickOpen}
              className={style.Buttons}
              variant='contained'
              color='success'
              startIcon={<AddCircleIcon className={style.buttonIcon} />}
            >
              <span className={style.buttonTextContainer}>ADD</span>
            </Button>
            <Button
              onClick={refreshData}
              className={style.Buttons}
              variant='contained'
              color='primary'
              startIcon={<RefreshIcon className={style.buttonIcon} />}
            >
              <span className={style.buttonTextContainer}>Refresh Data</span>
            </Button>
            <Button
              onClick={refreshRates}
              className={style.Buttons}
              variant='contained'
              color='secondary'
              startIcon={<RefreshIcon className={style.buttonIcon} />}
            >
              <span className={style.buttonTextContainer}>Refresh Rates</span>
            </Button>
            <Button
              onClick={() => {
                setDisplayRates(!displayRates)
              }}
              className={style.Buttons}
              variant='contained'
              color='warning'
              startIcon={<BarChartIcon className={style.buttonIcon} />}
            >
              <span className={style.buttonTextContainer}>Display Rates</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default GoldInvestments
