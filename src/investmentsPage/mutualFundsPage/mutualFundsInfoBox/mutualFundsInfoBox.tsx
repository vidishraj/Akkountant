import {
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import {
  addMutualFunds,
  insertMutualFunds,
  sellMutualFunds,
} from '../../../api/investmentsAPI.tsx/mutualFundsAPI'
import AgGrid from '../../../commonComponents/agGridComponent/agGrid'
import TabbedInterface from '../../../commonComponents/tabsComponent/tabsComponent'
import { useLoader } from '../../../contexts/loaderContext'
import { useMessage } from '../../../contexts/messageContext'
import { useMutualFundsContext } from '../../../contexts/mutualFundsContext'
import style from './mutualFundsInfoBox.module.scss'
import CloseIcon from '@mui/icons-material/Close'
import { formattedCurrency } from '../../stocksPage/stocksSummaryBox/stocksSummaryBox'

interface MutualFundsInfoProps {}

const MutualFundsInfoBox: React.FC<MutualFundsInfoProps> = () => {
  const { setPayload } = useMessage()
  const { mutualFundsData } = useMutualFundsContext()
  const [openModal, setOpenModal] = useState(false)
  const [actionType, setActionType] = useState<string>('')
  const { setStatus } = useLoader()

  function open(type: string, action: boolean) {
    setActionType(type)
    setOpenModal(action)
  }

  function mfManager(e, price, quantity, date) {
    e.preventDefault()
    setStatus((prev) => ({
      ...prev,
      mfBoxStatus: true,
    }))
    if (actionType === 'add') {
      let body = {
        schemeName: mutualFundsData.mfInfo.schemeName,
        schemeCode: mutualFundsData.mfInfo.schemeCode,
        addQuant: quantity,
        addNav: price,
        oldQuant: mutualFundsData.mfInfo.quantity,
        oldNav: mutualFundsData.mfInfo.NAV,
        buyDate: date,
      }
      addMutualFunds(body)
        .then((response) => {
          setPayload({ message: `Mutual Fund added`, type: 'success' })
        })
        .catch((error) => {
          setPayload({
            message: `Error while adding Mutual Fund ${error.response.data.Error}`,
            type: 'error',
          })
        })
        .finally(() => {
          setStatus((prev) => ({
            ...prev,
            mfBoxStatus: false,
          }))
        })
    } else if (actionType === 'sell') {
      let body = {
        schemeName: mutualFundsData.mfInfo.schemeName,
        schemeCode: mutualFundsData.mfInfo.schemeCode,
        soldQuant: quantity,
        soldNav: price,
        boughtQuant: mutualFundsData.mfInfo.quantity,
        boughtNav: mutualFundsData.mfInfo.NAV,
        sellDate: date,
      }

      sellMutualFunds(body)
        .then((response) => {
          setPayload({
            message: `Mutual Fund sold successfully.`,
            type: 'success',
          })
        })
        .catch((error) => {
          setPayload({
            message: `Error while selling MF ${error.response.data.Error}`,
            type: 'error',
          })
        })
        .finally(() => {
          setStatus((prev) => ({
            ...prev,
            mfBoxStatus: false,
          }))
        })
    } else if (actionType === 'buy') {
      let body = {
        schemeName: mutualFundsData.mfInfo.schemeName,
        schemeCode: mutualFundsData.mfInfo.schemeCode,
        investmentNAV: price,
        investmentQuant: quantity,
        purchaseDate: date,
      }

      insertMutualFunds(body)
        .then((response) => {
          setPayload({
            message: `Mutual Fund added to portfolio`,
            type: 'success',
          })
        })
        .catch((error) => {
          setPayload({
            message: `Error while buying Mutual Fund ${error.response.data.Error}`,
            type: 'error',
          })
        })
        .finally(() => {
          setStatus((prev) => ({
            ...prev,
            mfBoxStatus: false,
          }))
        })
    }

    setOpenModal(false) // Close the modal after submission
  }

  return (
    <div className={style.stockInfoParent}>
      {mutualFundsData.mfInfo &&
      Object.keys(mutualFundsData?.mfInfo).length > 0 ? (
        mutualFundsData.mfInfo.purchased ? (
          <>
            {' '}
            <TabbedInterface
              tabContent={[
                <>
                  <MfInfoDetails
                    stockInfo={mutualFundsData.mfInfo}
                    purchased={mutualFundsData.mfInfo.purchased ? true : false}
                    setOpenModal={open}
                  />
                  <CustomModal
                    onSubmitHandler={mfManager}
                    isOpen={openModal}
                    toggle={open}
                    mutualFundsData={mutualFundsData}
                  />
                </>,
                <>
                  <MfTransactionsTab
                    transactions={mutualFundsData.mfTransactions}
                    stocksData={mutualFundsData.mfInfo}
                  ></MfTransactionsTab>
                </>,
              ]}
              numberOfTabs={2}
              tabNames={['Mutual Fund Info', 'Investment Info']}
            />
          </>
        ) : (
          <>
            <MfInfoDetails
              stockInfo={mutualFundsData.mfInfo}
              purchased={mutualFundsData.mfInfo.purchased ? true : false}
              setOpenModal={open}
            />
            <CustomModal
              onSubmitHandler={mfManager}
              isOpen={openModal}
              toggle={open}
              mutualFundsData={mutualFundsData}
            />
          </>
        )
      ) : (
        <div className={style.stockInfoEmpty}>
          Pick a stock from the stock list or search for one.
        </div>
      )}
    </div>
  )
}

const CustomModal = ({ isOpen, toggle, mutualFundsData, onSubmitHandler }) => {
  const styles = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  }

  const [price, setPrice] = useState<any>()
  const [quantity, setQuantity] = useState<any>()
  const [selectedDate, handleDateChange] = useState<any>()

  return (
    <Modal
      open={isOpen}
      onClose={toggle}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={styles} className={style.customModal}>
        <IconButton
          edge='end'
          color='inherit'
          onClick={toggle}
          aria-label='close'
          sx={{ position: 'absolute', top: 0, right: 10 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id='modal-modal-title' className={''}>
          <span style={{ color: 'black', width: '30px' }}>
            {mutualFundsData.mfInfo.schemeName}{' '}
          </span>
          <span style={{ color: 'grey', width: '10px' }}>
            [{mutualFundsData.mfInfo.schemeName}]{' '}
          </span>
        </Typography>
        <Typography id='modal-modal-title' className={style.modalInput}>
          <span style={{ color: 'black', width: '30px' }}>NAV: </span>
          <input
            type={'text'}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
        </Typography>
        <Typography
          id='modal-modal-description'
          sx={{ mt: 2 }}
          className={style.modalInput}
        >
          <span style={{ color: 'black', width: '30px' }}>Quantity: </span>
          <input
            type={'text'}
            onChange={(e) => setQuantity(parseFloat(e.target.value))}
          />
        </Typography>
        <Typography
          id='modal-modal-description'
          sx={{ mt: 2 }}
          className={style.modalInput}
        >
          <span style={{ color: 'black', width: '30px' }}>Date: </span>
          <TextField
            type='date'
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </Typography>
        <Button
          variant='contained'
          onClick={(e) => onSubmitHandler(e, price, quantity, selectedDate)}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  )
}

const MfInfoDetails = ({ stockInfo, setOpenModal, purchased }) => {
  return (
    <>
      {stockInfo?.schemeName && (
        <div className={style.stocksInfoBox}>
          <div className={style.stockInfoHeading}>
            <h3>{stockInfo.schemeName}</h3>
            <div>
              <span>{stockInfo.schemeCode}</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.fundHouse}</span>
              <span
                className={style.captionContainer}
                style={{ background: 'none', color: '' }}
              >
                Fund House
              </span>
            </div>
          </div>

          <div className={style.stockInfoBody}>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.latestNav}</span>
              <span className={style.captionContainer}>Current NAV</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.schemeType}</span>
              <span className={style.captionContainer}>Scheme type</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.schemeStartDate}</span>
              <span className={style.captionContainer}>Scheme Start Date</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.schemeStartNav}</span>
              <span className={style.captionContainer}>Scheme Start NAV</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.lastUpdated}</span>
              <span className={style.captionContainer}>Last Updated</span>
            </div>
          </div>
          {!purchased ? (
            <div
              style={{
                width: '100%',
                paddingTop: '15px',
                paddingBottom: '5px',
                background: '',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button
                variant='contained'
                onClick={() => setOpenModal('buy', true)}
                style={{ backgroundColor: 'green', maxWidth: 'max-content' }}
              >
                Buy
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                paddingTop: '15px',
                paddingBottom: '5px',
              }}
            >
              <Button
                variant='contained'
                onClick={() => setOpenModal('add', true)}
                style={{ backgroundColor: 'green', maxWidth: 'max-content' }}
              >
                Buy
              </Button>
              <Button
                variant='contained'
                onClick={() => setOpenModal('sell', true)}
                style={{ backgroundColor: 'red', maxWidth: 'max-content' }}
              >
                Sell
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

const MfTransactionsTab = ({ transactions, stocksData }) => {
  const columnDefs = [
    { headerName: 'Date', field: 'date', sortable: true, width: 120, suppressMovable:true },
    { headerName: 'Amount', field: 'amount', sortable: true, width: 120, suppressMovable:true },
    { headerName: 'Gains', field: 'gains', sortable: true, width: 100, suppressMovable:true },
    { headerName: 'Quantity', field: 'quantity', sortable: true, width: 120, suppressMovable:true },
    { headerName: 'Type', field: 'type', sortable: true, width: 120, suppressMovable:true },
  ]

  return (
    <div className={style.secondTab}>
      <div className={style.topInfo}>
        <div className={style.infoContainer}>
          <span> {stocksData.latestNav}</span>
          <span className={style.captionContainer}>Latest NAV</span>
        </div>
        <div className={style.infoContainer}>
          <span>{stocksData.quantity}</span>
          <span className={style.captionContainer}>Quantity</span>
        </div>
        <div className={style.infoContainer}>
          <span>{formattedCurrency(stocksData.investedAmount)}</span>
          <span className={style.captionContainer}>Invested Amount</span>
        </div>
      </div>
      <AgGrid
        rowData={transactions[stocksData.schemeCode]}
        columnDefs={columnDefs}
        width={'50'}
        height={'100'}
        parentStyle={style.agGrid}
      />
    </div>
  )
}

export default MutualFundsInfoBox
