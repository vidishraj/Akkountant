import { Button } from '@mui/material'
import style from './goldCard.module.scss'
import DeleteIcon from '@mui/icons-material/Delete'
import { deleteGoldDeposit } from '../../../api/investmentsAPI.tsx/goldAPI'
interface GoldPurchase {
  data: {
    depositID: number
    purchaseDate: string
    description: string
    goldType: string
    purchaseAmount: string
    purchaseQuantity: string
  }
}

const GoldCard: React.FC<GoldPurchase> = (props) => {
  const { data } = props

  function formatDate(dateString) {
    const [day, month, year] = dateString.split('/')
    const date = new Date(`${year}-${month}-${day}`)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function deleteDeposit(id) {
    let data = new FormData()
    data.append('id', id)
    deleteGoldDeposit(data).then((response) => {})
  }
  return (
    <div className={style.cardBox}>
      <div className={style.firstLine}>
        <div className={style.infoContainer} style={{ flexBasis: '60%' }}>
          <span> {formatDate(data.purchaseDate)} </span>
          <span className={style.captionContainer}>Date</span>
        </div>
        <div className={style.infoContainer}>
          <span>{data.goldType}K</span>
          <span className={style.captionContainer}>Type</span>
        </div>
      </div>
      <div className={style.desc}>
        <div className={style.infoContainer}>
          <span> {data.description}</span>
          <span className={style.captionContainer}>Description</span>
        </div>
      </div>
      <div className={style.lastLine}>
        <div className={style.infoContainer}>
          <span>
            {' '}
            {parseFloat(data.purchaseAmount).toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 2,
            })}
          </span>
          <span className={style.captionContainer}>Amount</span>
        </div>
        <div className={style.infoContainer}>
          <span>{data.purchaseQuantity}g</span>
          <span className={style.captionContainer}>Total Weight</span>
        </div>
      </div>
      <Button
        onClick={() => deleteDeposit(data.depositID)}
        className={style.deleteButton}
        variant='contained'
        color='error'
        startIcon={<DeleteIcon />}
      >
        {' '}
        Delete{' '}
      </Button>
    </div>
  )
}

export default GoldCard
