import style from './summaryBox.module.scss'

interface SummaryBoxProps {
  investedAmount: string
  currentAmount: string
  change: string
  changePercent: string
  investmentCount: string
  totalQuant: string
}

const SummaryBox: React.FC<SummaryBoxProps> = (props) => {
  const {
    investedAmount,
    currentAmount,
    change,
    changePercent,
    investmentCount,
    totalQuant,
  } = props

  return (
    <div className={style.summaryBox}>
      <div className={style.infoContainer}>
        <span>
          {parseFloat(investedAmount).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })}
        </span>
        <span className={style.captionContainer}>Invested Amount</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {parseFloat(currentAmount).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })}
        </span>
        <span className={style.captionContainer}>Current</span>
      </div>
      <div className={style.infoContainer}>
        <span>
          {parseFloat(change).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })}
        </span>
        <span className={style.captionContainer}>Change</span>
      </div>
      <div className={style.infoContainer}>
        <span> {changePercent} %</span>
        <span className={style.captionContainer}>Change %</span>
      </div>
      <div className={style.infoContainer}>
        <span> {investmentCount}</span>
        <span className={style.captionContainer}>Count</span>
      </div>
      <div className={style.infoContainer}>
        <span> {totalQuant} g</span>
        <span className={style.captionContainer}>Total Weight</span>
      </div>
    </div>
  )
}

export default SummaryBox
