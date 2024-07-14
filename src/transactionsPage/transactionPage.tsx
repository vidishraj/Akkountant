import { useNavigate } from 'react-router-dom'
import { useGlobal } from '../contexts/globalContext'
import { useMessage } from '../contexts/messageContext'
import './transactionPage.css'
import { useEffect } from 'react'
import Header from '../commonComponents/header/header'
import TransactionsTable from './transactionTable/transactionTable'
import LiveTable from './liveTable/liveTable'
import FileUploadTab from './fileUploadTab/FileUploadTab'
import ScrollDownArrow from '../commonComponents/scroller/scroller'
import AutoTagPopUp from '../commonComponents/autoTagPopUpComponent/autoTagPopUp'
import { addAutoTag, allBanksData, fetchLiveTable } from '../api/transactionPageAPI'
import { useLoader } from '../contexts/loaderContext'

const TransactionsPage = () => {
  const { signedIn, autoTagOpen, setAutoTagOpen, details} = useGlobal()
  const { setStatus} =useLoader()
  const { setPayload } = useMessage()
  const navigate = useNavigate()
  useEffect(() => {
    if (!signedIn) {
      setPayload({
        message: 'User must sign in first',
        type: 'warning',
      })
      navigate('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  function autoTagAddition(details:string, tag:string){
    setStatus((prev)=>({
      ...prev,
      mainTransactionStatus:true,
      liveTableStatus:true
    }))
    addAutoTag(details, tag).then((response)=>{
      fetchLiveTable(true);
      allBanksData(true);
      setPayload({
        type:'success',
        message:'Successfully added entity to auto-tagging'
      })
    }).catch((error)=>{
      setPayload({
        type: 'error',
        message: `Error while updating tag ${error}`,
      })
    }).finally(()=>{
      setStatus((prev)=>({
        ...prev,
        mainTransactionStatus:false,
        liveTableStatus:false
      }))
  });
    setAutoTagOpen(false)
  }
  return (
    <>
      <Header navigater={navigate}></Header>
      <div className='transactionsPage'>
        {signedIn && (
          autoTagOpen?<AutoTagPopUp isOpen={autoTagOpen} onSubmitHandler={(details:string, tag:string)=>{autoTagAddition(details, tag)}} toggle={()=>{setAutoTagOpen(!autoTagOpen)}} details={details}/>:
          (<>
            <LiveTable />
            <TransactionsTable />
            <FileUploadTab />
            <ScrollDownArrow />
          </>)
        )}
      </div>
    </>
  )
}

export default TransactionsPage
