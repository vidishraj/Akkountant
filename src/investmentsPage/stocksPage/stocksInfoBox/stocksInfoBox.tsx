import { Box, Button, Modal, Typography } from '@mui/material'
import React, { useState, useEffect, useRef } from 'react'
import {
  addStock,
  insertStock,
  sellStock,
} from '../../../api/investmentsAPI.tsx/stocksAPI'
import AgGrid from '../../../commonComponents/agGridComponent/agGrid'
import TabbedInterface from '../../../commonComponents/tabsComponent/tabsComponent'
import { useLoader } from '../../../contexts/loaderContext'
import { useMessage } from '../../../contexts/messageContext'
import { useStocksContext } from '../../../contexts/stocksContext'
import style from './stockInfoBox.module.scss'

interface StocksInfoBoxProps {
  refreshData: any
}

const StocksInfoBox: React.FC<StocksInfoBoxProps> = (props) => {
  const { setPayload } = useMessage()
  const { refreshData } = props
  const { stocksData } = useStocksContext()
  const [openModal, setOpenModal] = useState(false)
  const [actionType, setActionType] = useState<string>('')
  const { setStatus } = useLoader()

  function open(type: string, action: boolean) {
    setActionType(type)
    setOpenModal(action)
  }

  function stockManager(e, price, quantity) {
    e.preventDefault()
    setStatus((prev) => ({
      ...prev,
      stockBoxStatus: true,
    }))
    if (actionType === 'add') {
      let body = {
        stockCode: stocksData.stocksInfo.symbol,
        addedQuant: quantity,
        addedPrice: price,
        oldQuant: stocksData.stocksInfo.quantity,
        oldPrice: stocksData.stocksInfo.price,
      }
      addStock(body)
        .then((response) => {
          setPayload({ message: `New shares added`, type: 'success' })
          refreshData()
        })
        .catch((error) => {
          setPayload({
            message: `Error while adding shares ${error.response.data.Error}`,
            type: 'error',
          })
        })
        .finally(() => {
          setStatus((prev) => ({
            ...prev,
            stockBoxStatus: false,
          }))
        })
    } else if (actionType === 'sell') {
      let body = {
        stockCode: stocksData.stocksInfo.symbol,
        soldQuant: quantity,
        soldPrice: price,
        oldQuant: stocksData.stocksInfo.quantity,
        oldPrice: stocksData.stocksInfo.price,
      }

      sellStock(body)
        .then((response) => {
          setPayload({ message: `Shares sold successfully.`, type: 'success' })
          refreshData()
        })
        .catch((error) => {
          setPayload({
            message: `Error while selling shares ${error.response.data.Error}`,
            type: 'error',
          })
        })
        .finally(() => {
          setStatus((prev) => ({
            ...prev,
            stockBoxStatus: false,
          }))
        })
    } else if (actionType === 'buy') {
      let body = {
        stockCode: stocksData.stocksInfo.symbol,
        stockName: stocksData.stocksInfo.stockName,
        purchasePrice: price,
        purchaseQuant: quantity,
      }

      insertStock(body)
        .then((response) => {
          setPayload({ message: `Stock added to portfolio`, type: 'success' })
          refreshData()
        })
        .catch((error) => {
          setPayload({
            message: `Error while buying stock ${error.response.data.Error}`,
            type: 'error',
          })
        })
        .finally(() => {
          setStatus((prev) => ({
            ...prev,
            stockBoxStatus: false,
          }))
        })
    }

    setOpenModal(false)
  }

  return (
    <div className={style.stockInfoParent}>
      {stocksData.stocksInfo &&
      Object.keys(stocksData?.stocksInfo).length > 0 ? (
        stocksData.stocksInfo.purchased ? (
          <>
            {' '}
            <TabbedInterface
              tabContent={[
                <>
                  <StocksInfoDetails
                    stockInfo={stocksData.stocksInfo}
                    purchased={stocksData.stocksInfo.purchased ? true : false}
                    setOpenModal={open}
                  />
                  <CustomModal
                    onSubmitHandler={stockManager}
                    isOpen={openModal}
                    toggle={open}
                    stockData={stocksData}
                    actionType={actionType}
                  />
                </>,
                <>
                  <StocksTransactionsTab
                    transactions={stocksData.stocksTransactions}
                    stocksData={stocksData.stocksInfo}
                  ></StocksTransactionsTab>
                </>,
              ]}
              numberOfTabs={2}
              tabNames={['Stocks Info', 'Purchased Info']}
            />
          </>
        ) : (
          <>
            <StocksInfoDetails
              stockInfo={stocksData.stocksInfo}
              purchased={stocksData.stocksInfo.purchased ? true : false}
              setOpenModal={open}
            />
            <CustomModal
              onSubmitHandler={stockManager}
              isOpen={openModal}
              toggle={open}
              stockData={stocksData}
              actionType={actionType}
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

const CustomModal = ({
  isOpen,
  toggle,
  stockData,
  onSubmitHandler,
  actionType,
}) => {
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
  const boxRef = useRef<any>()
  const [price, setPrice] = useState<number>()
  const [quantity, setQuantity] = useState<number>()

  const handleClickOutside = (event) => {
    if (boxRef.current && !boxRef.current.contains(event.target)) {
      toggle()
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function checkQuant(event: any) {
    if (stockData.stocksInfo.quantity && actionType === 'sell') {
      if (event.target.value <= stockData.stocksInfo.quantity) {
        setQuantity(parseFloat(event.target.value))
      } else {
        event.target.value = ''
      }
    } else {
      setQuantity(parseFloat(event.target.value))
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={toggle}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={styles} className={style.customModal} ref={boxRef}>
        <Typography id='modal-modal-title' className={''}>
          <span style={{ color: 'black', width: '30px' }}>
            {stockData.stocksInfo.stockName}{' '}
          </span>
          <span style={{ color: 'grey', width: '10px' }}>
            [{stockData.stocksInfo.symbol}]{' '}
          </span>
        </Typography>
        <Typography id='modal-modal-title' className={style.modalInput}>
          <span style={{ color: 'black', width: '30px' }}>Price: </span>
          <input
            type={'number'}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
        </Typography>
        <Typography
          id='modal-modal-description'
          sx={{ mt: 2 }}
          className={style.modalInput}
        >
          <span style={{ color: 'black', width: '30px' }}>Quantity: </span>
          <input type={'number'} onChange={checkQuant} />
        </Typography>
        <Button
          variant='contained'
          onClick={(e) => onSubmitHandler(e, price, quantity)}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  )
}

const StocksInfoDetails = ({ stockInfo, setOpenModal, purchased }) => {
  return (
    <>
      {stockInfo?.stockName && (
        <div className={style.stocksInfoBox}>
          <div className={style.stockInfoHeading}>
            <h3>{stockInfo.stockName}</h3>
            <div>
              <span>{stockInfo.symbol}</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.industry}</span>
              <span className={style.captionContainer}>Industry</span>
            </div>
          </div>

          <div className={style.stockInfoBody}>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.currentPrice}</span>
              <span className={style.captionContainer}>Current</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.change.toFixed(2)}</span>
              <span className={style.captionContainer}>Change</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.percentChange.toFixed(2)}</span>
              <span className={style.captionContainer}>% Change</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.dayOpen}</span>
              <span className={style.captionContainer}>Open</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.dayClose}</span>
              <span className={style.captionContainer}>Close</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.prevClose}</span>
              <span className={style.captionContainer}>prev. close</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.dayHigh}</span>
              <span className={style.captionContainer}>day highs</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.dayLow}</span>
              <span className={style.captionContainer}>day low</span>
            </div>
            <div className={style.simpleInfoContainer}>
              <span>{stockInfo.volume}</span>
              <span className={style.captionContainer}>volume</span>
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

const StocksTransactionsTab = ({ transactions, stocksData }) => {
  const columnDefs = [
    { headerName: 'Date', field: 'date', sortable: true, width: 120, suppressMovable:true },
    { headerName: 'Amount', field: 'amount', sortable: true, width: 120, suppressMovable:true },
    { headerName: 'Gains', field: 'gains', sortable: true, width: 100, suppressMovable:true },
    { headerName: 'Quantity', field: 'quantity', sortable: true, width: 120, suppressMovable:true },
    { headerName: 'Type', field: 'type', sortable: true, width: 120, suppressMovable:true },
  ]

  calculateChange()

  function calculateChange() {
    return (
      (stocksData.currentPrice - stocksData.price) *
      stocksData.quantity
    ).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    })
  }

  function calculatePercentChange() {
    let change =
      (stocksData.currentPrice - stocksData.price) * stocksData.quantity
    return ((change / (stocksData.quantity * stocksData.price)) * 100).toFixed(
      2,
    )
  }

  return (
    <div className={style.secondTab}>
      <div className={style.topInfoContainer}>
        <div className={style.topInfo}>
          <div className={style.infoContainer}>
            <span>
              {' '}
              {stocksData.price.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
              })}
            </span>
            <span className={style.captionContainer}>Price</span>
          </div>
          <div className={style.infoContainer}>
            <span>{stocksData.quantity}</span>
            <span className={style.captionContainer}>Quantity</span>
          </div>
          <div className={style.infoContainer}>
            <span>
              {(stocksData.quantity * stocksData.price).toLocaleString(
                'en-IN',
                {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                },
              )}
            </span>
            <span className={style.captionContainer}>Invested</span>
          </div>
        </div>
        <div className={style.topInfo}>
          <div className={style.infoContainer}>
            <span>{calculateChange()}</span>
            <span className={style.captionContainer}>Change</span>
          </div>
          <div className={style.infoContainer}>
            <span>{calculatePercentChange()}%</span>
            <span className={style.captionContainer}>% Change</span>
          </div>
        </div>
      </div>
      <AgGrid
        rowData={transactions[stocksData.symbol]}
        columnDefs={columnDefs}
        width={'50'}
        height={'50'}
        parentStyle={style.agGrid}
      />
    </div>
  )
}

export default StocksInfoBox
