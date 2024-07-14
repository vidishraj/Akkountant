import './summaryBox.css'

interface SummaryBoxProps {
  totalDebited?: number
  totalCredited?: number
  className?: string
}

const SummaryBox: React.FC<SummaryBoxProps> = (props) => {
  const { totalCredited, totalDebited, className } = props
  const netAmount = totalCredited - totalDebited

  return (
    <>
      {totalCredited || totalDebited ? (
        <div className={`summary-box ${className}`}>
          {totalDebited && totalDebited !== 0 ? (
            <div className='summary-line'>
              Total Debits:{' '}
              <span id='total-debits'>
                {totalDebited?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ) : (
            <></>
          )}
          {totalCredited && totalCredited !== 0 ? (
            <div className='summary-line'>
              Total Credits:{' '}
              <span id='total-credits'>
                {totalCredited?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ) : (
            <></>
          )}
          {totalCredited && totalDebited && netAmount !== 0 ? (
            <div className='summary-line'>
              Net:{' '}
              <span
                style={{
                  color: netAmount > 0 ? '#0cca98' : '#E57373',
                }}
              >
                {Math.abs(netAmount)?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

export default SummaryBox
