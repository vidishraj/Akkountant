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
  import style from './npsInfoBox.module.scss'
  import CloseIcon from '@mui/icons-material/Close'
  import { formattedCurrency } from '../../stocksPage/stocksSummaryBox/stocksSummaryBox'
import { PensionSchemeData, useNPSContext } from '../../../contexts/npsContext'
import { Tooltip } from 'react-tooltip'

  interface NPSInfoProps {}
  
  const NPSInfoBox: React.FC<NPSInfoProps> = () => {
    const { setPayload } = useMessage()
    const { npsData } = useNPSContext()
    const [openModal, setOpenModal] = useState(false)
    const [actionType, setActionType] = useState<string>('')
    const { setStatus } = useLoader()
  
    function open(type: string, action: boolean) {
      setActionType(type)
      setOpenModal(action)
    }
  
    function npsManager(e, price, quantity, date) {
      e.preventDefault()
      setStatus((prev) => ({
        ...prev,
        npsBoxStatus: true,
      }))
      if (actionType === 'add') {
        let body = {
          schemeCode: npsData.npsInfo.schemeCode,
          fmCode: npsData.npsInfo.fmCode,
          addQuant: quantity,
          addNav: price,
          oldQuant: npsData.npsInfo.investedQuant,
          oldNav: npsData.npsInfo.investedNav,
          buyDate: date,
        }
        addMutualFunds(body)
          .then((response) => {
            setPayload({ message: `NPS added`, type: 'success' })
          })
          .catch((error) => {
            setPayload({
              message: `Error while adding NPS ${error.response.data.Error}`,
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
          fmCode: npsData.npsInfo.fmCode,
          schemeCode: npsData.npsInfo.schemeCode,
          soldQuant: quantity,
          soldNav: price,
          boughtQuant: npsData.npsInfo.investedQuant,
          boughtNav: npsData.npsInfo.investedNav,
          sellDate: date,
        }
  
        sellMutualFunds(body)
          .then((response) => {
            setPayload({
              message: `NPS sold successfully.`,
              type: 'success',
            })
          })
          .catch((error) => {
            setPayload({
              message: `Error while selling NPS ${error.response.data.Error}`,
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
          fmCode: npsData.npsInfo.fmCode,
          schemeCode: npsData.npsInfo.schemeCode,
          investmentNAV: price,
          investmentQuant: quantity,
          purchaseDate: date,
        }
  
        insertMutualFunds(body)
          .then((response) => {
            setPayload({
              message: `NPS added to portfolio`,
              type: 'success',
            })
          })
          .catch((error) => {
            setPayload({
              message: `Error while buying NPS ${error.response.data.Error}`,
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
        {npsData.npsInfo &&
        Object.keys(npsData?.npsInfo).length > 0 ? (
          npsData.npsInfo.purchased ? (
            <>
              {' '}
              <TabbedInterface
                tabContent={[
                  <>
                    <NPSInfoDetails
                      npsInfo={npsData.npsInfo}
                      purchased={npsData.npsInfo.purchased ? true : false}
                      setOpenModal={open}
                    />
                    <CustomModal
                      onSubmitHandler={npsManager}
                      isOpen={openModal}
                      toggle={open}
                      npsData={npsData}
                    />
                  </>,
                  <>
                    <NPSTransactionsTab
                      transactions={npsData.npsTransactions}
                      npsData={npsData.npsInfo}
                    ></NPSTransactionsTab>
                  </>,
                ]}
                numberOfTabs={2}
                tabNames={['Mutual Fund Info', 'Investment Info']}
              />
            </>
          ) : (
            <>
              <NPSInfoDetails
                npsInfo={npsData.npsInfo}
                purchased={npsData.npsInfo.purchased ? true : false}
                setOpenModal={open}
              />
              <CustomModal
                onSubmitHandler={npsManager}
                isOpen={openModal}
                toggle={open}
                npsData={npsData}
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
  
  const CustomModal = ({ isOpen, toggle, npsData, onSubmitHandler }) => {
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
              {npsData.npsInfo.schemeName}{' '}
            </span>
            <span style={{ color: 'grey', width: '10px' }}>
              [{npsData.npsInfo.schemeName}]{' '}
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
  
  const NPSInfoDetails: React.FC<{npsInfo:PensionSchemeData,setOpenModal:any, purchased:boolean }> = ({ npsInfo, setOpenModal, purchased })=> {
    
    return (
      <>
        {npsInfo?.schemeName && (
          <div className={style.stocksInfoBox}>
            <div className={style.stockInfoHeading}>
              <h3>{npsInfo.schemeName}</h3>
              <div>
                <span>{npsInfo.schemeCode}</span>
              </div>
              <div className={style.simpleInfoContainer}>
                <span>{npsInfo.fmName}</span>
                {/* <span
                  className={style.captionContainer}
                  style={{ background: 'white', color: 'black', padding:"2px"}}
                  
                >
                  Fund Manager
                </span> */}
              </div>
            </div>
            <div className={style.stockInfoBody}>
              <div className={style.npsFirstLine}>
              <div className={style.simpleInfoContainer}>
                <span>{npsInfo.currentNAV}</span>
                <span className={style.captionContainer}>Current NAV</span>
              </div>
              <div className={style.simpleInfoContainer}>
                <span>{npsInfo.inceptionDate}</span>
                <span className={style.captionContainer}>Scheme Start Date</span>
              </div>
              <div className={style.simpleInfoContainer}>
                <span>{npsInfo.yearHigh}</span>
                <span className={style.captionContainer}>52 wk high</span>
              </div>
              <div className={style.simpleInfoContainer}>
                <span>{npsInfo.yearLow}</span>
                <span className={style.captionContainer}>52 wk low</span>
              </div>
              </div>
              <div className={style.npsSecondLine}>
              <div className={style.simpleInfoContainer} style={{flexBasis:"50%", display:"flex", alignItems:"center", justifyContent:"center"}}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a data-for={1} href={null} data-tooltip-wrapper ="span" className={style.holdings} data-tooltip-id="1" data-tooltip-content={npsInfo.topHoldings?.replaceAll(";",', ')}>
                  {npsInfo.topHoldings?.slice(0, npsInfo.topHoldings.length<50?npsInfo.topHoldings.length:50).replaceAll(";",', ')}
                </a>
                <Tooltip id="1" className={style.myTooltip} place='top' />
                <span className={style.captionContainer}>Top Holdings</span>
              </div>
              <div className={style.simpleInfoContainer} style={{flexBasis:"50%"}}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a data-for={2} data-tooltip-wrapper ="span" className={style.holdings} data-tooltip-id="2" data-tooltip-content={npsInfo.topSectors?.replaceAll(";",', ')}>
                  {npsInfo.topSectors?.slice(0, npsInfo.topSectors.length<50?npsInfo.topSectors.length:50).replaceAll(";",', ')}
                </a>
                <Tooltip id="2" className={style.myTooltip}  place='top'/>
                <span className={style.captionContainer}>Top Sectors</span>
              </div>
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
                  style={{ backgroundColor: '#06520f', maxWidth: 'max-content' }}
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
                  style={{ backgroundColor: '#06520f', maxWidth: 'max-content' }}
                >
                  Buy
                </Button>
                <Button
                  variant='contained'
                  onClick={() => setOpenModal('sell', true)}
                  style={{ backgroundColor: '#9d1118', maxWidth: 'max-content' }}
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
  
  const NPSTransactionsTab:React.FC<{transactions:any, npsData:PensionSchemeData}> = ({ transactions, npsData }) => {
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
            <span> {npsData.currentNAV}</span>
            <span className={style.captionContainer}>Latest NAV</span>
          </div>
          <div className={style.infoContainer}>
            <span>{npsData.investedQuant}</span>
            <span className={style.captionContainer}>Quantity</span>
          </div>
          <div className={style.infoContainer}>
            <span>{formattedCurrency((npsData.investedAmount)?.toString())}</span>
            <span className={style.captionContainer}>Invested Amount</span>
          </div>
        </div>
        <AgGrid
          rowData={transactions[npsData.schemeCode]}
          columnDefs={columnDefs}
          width={'50'}
          height={'100'}
          parentStyle={style.agGrid}
        />
      </div>
    )
  }
  
  export default NPSInfoBox;