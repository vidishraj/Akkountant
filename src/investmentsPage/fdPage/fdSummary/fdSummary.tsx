import style from './fdSummary.module.scss'

export interface FDBoxProps {
  investedAmount: any
  maturityAmount: any
  change: any
  changePercent: any
  investmentCount: any
}

const FDSummary: React.FC<FDBoxProps> = (props) => {
  const {
    investedAmount,
    maturityAmount,
    change,
    changePercent,
    investmentCount,
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
          {parseFloat(maturityAmount).toLocaleString('en-IN', {
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
        <span> {changePercent.toFixed(2)} %</span>
        <span className={style.captionContainer}>Change %</span>
      </div>
      <div className={style.infoContainer}>
        <span> {investmentCount}</span>
        <span className={style.captionContainer}>Count</span>
      </div>
    </div>
  )
}

export default FDSummary
