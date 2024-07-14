import { Button } from '@mui/material'
import { useLoader } from '../../contexts/loaderContext'
import style from './fdPage.module.scss'
import BarChartIcon from '@mui/icons-material/BarChart'
import { useState, useEffect } from 'react'
import { useFDContext } from '../../contexts/fdContext'
import FDSummary, { FDBoxProps } from './fdSummary/fdSummary'
import RefreshIcon from '@mui/icons-material/Refresh'
import FDLoaderLottie from '../../commonComponents/lottieAnimations/fdLoaderAnimation'
import FDLeftAnimation from '../../commonComponents/lottieAnimations/fdLeftAnimation'
import FDRightAnimation from '../../commonComponents/lottieAnimations/fdRightAnimation'
import Carousel from './fdBox/fdBox'
import FDInsertDialog from './fdInsertDialog/fdInsertDialog'
import { fetchFD } from '../../api/investmentsAPI.tsx/fdAPI'

const FDPage = () => {
  const loader = useLoader()
  const [openInsertDialog, setInsertDialog] = useState<boolean>(false)
  const [summary, setSummary] = useState<FDBoxProps>({
    investedAmount: 0,
    maturityAmount: 0,
    change: 0,
    changePercent: 0,
    investmentCount: 0,
  })
  const fdCtx = useFDContext()

  useEffect(() => {
    if (fdCtx?.fdData?.fdList?.length > 0) {
      summaryData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fdCtx])

  const summaryData = () => {
    let localSummary: any = {
      investedAmount: 0,
      maturityAmount: 0,
      change: 0,
      changePercent: 0,
      investmentCount: 0,
    }
    fdCtx?.fdData?.fdList?.forEach((el) => {
      localSummary.investedAmount += el.investedAmount
      localSummary.investmentCount += 1
      localSummary.maturityAmount += el.maturityAmount
      localSummary.change += el.maturityAmount - el.investedAmount
    })
    localSummary.changePercent =
      (localSummary.change / localSummary.investedAmount) * 100
    setSummary((prev) => ({
      ...prev,
      ...localSummary,
    }))
  }

  function refreshData() {
    loader.setStatus((prev) => ({
      ...prev,
      fdBoxStatus: true,
    }))
    fetchFD(true)
      .then((response) => {
        fdCtx.dispatch({
          type: 'UPDATE_FD',
          payload: response.data.Message,
        })
      })
      .finally(() => {
        loader.setStatus((prev) => ({
          ...prev,
          fdBoxStatus: false,
        }))
      })
  }

  return (
    <div className={style.goldPage}>
      {loader.status.fdBoxStatus ? (
        <FDLeftAnimation
          style={{ backgroundColor: 'white', height: '90vh', width: '100vw' }}
        />
      ) : (
        <>
          <FDInsertDialog
            open={openInsertDialog}
            handleClose={() => setInsertDialog(false)}
          />
          <FDSummary {...summary} />
          <div className={style.carBox}>
            <FDLoaderLottie style={{ flexBasis: '15%', alignSelf: 'center' }} />
            <Carousel />
            <FDRightAnimation
              style={{ flexBasis: '15%', alignSelf: 'center' }}
            />
          </div>
          <div className={style.buttonContainer}>
            <Button
              onClick={refreshData}
              style={{ maxWidth: 'fit-content', fontWeight: '900' }}
              variant='contained'
              color='primary'
              startIcon={<RefreshIcon />}
            >
              {' '}
              Refresh Data{' '}
            </Button>
            <Button
              onClick={() => {
                setInsertDialog(true)
              }}
              style={{ maxWidth: 'fit-content', fontWeight: '900' }}
              variant='contained'
              color='warning'
              startIcon={<BarChartIcon />}
            >
              {' '}
              Insert Deposit{' '}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default FDPage
