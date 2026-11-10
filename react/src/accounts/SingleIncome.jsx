
import { useNavigate } from 'react-router-dom'

const formatDate = (value) => {
    if (!value) return 'תאריך לא צוין'
    const [year, month, day] = String(value).slice(0, 10).split('-')
    return year && month && day ? `${day}/${month}/${year}` : String(value)
}

const SingleIncome = ({ income }) => {
    const navigate = useNavigate()
    const renterName = typeof income.renter === 'object' ? income.renter?.name : ''
    const incomeDate = String(income.date || '').slice(0, 10)
    const description = renterName
        ? `${renterName}${income.incomeType === 'advance' ? ' - מקדמה' : ''}`
        : income.renter ? 'תשלום משוכר' : 'תשלום שהתקבל'

    return (
        <article className="income-item">
            <span className="income-item-icon"><i className="pi pi-arrow-down-left" aria-hidden="true" /></span>
            <div className="income-item-description">
                <strong>{description}</strong>
                <button
                    className="income-item-date"
                    type="button"
                    disabled={!/^\d{4}-\d{2}-\d{2}$/.test(incomeDate)}
                    aria-label={`פתיחת לוח ההשכרות בתאריך ${formatDate(income.date)}`}
                    onClick={() => navigate('/rents', { state: { selectedDate: incomeDate } })}
                >
                    {formatDate(income.date)}
                </button>
            </div>
            <span className="income-payment-type">{income.paymentType || 'לא צוין אמצעי תשלום'}</span>
            <strong className="income-item-amount">{Number(income.sum || 0).toLocaleString('he-IL')} ₪</strong>
        </article>
    )
}

export default SingleIncome