import React from 'react'

const formatDate = (value) => {
    if (!value) return 'תאריך לא צוין'
    const [year, month, day] = String(value).slice(0, 10).split('-')
    return year && month && day ? `${day}/${month}/${year}` : String(value)
}

const SingleIncome = ({ income }) => {
    const renterName = typeof income.renter === 'object' ? income.renter?.name : ''
    const description = renterName || (income.renter ? 'תשלום משוכר' : 'תשלום שהתקבל')

    return (
        <article className="income-item">
            <span className="income-item-icon"><i className="pi pi-arrow-down-left" aria-hidden="true" /></span>
            <div className="income-item-description">
                <strong>{description}</strong>
                <span>{formatDate(income.date)}</span>
            </div>
            <span className="income-payment-type">{income.paymentType || 'לא צוין אמצעי תשלום'}</span>
            <strong className="income-item-amount">{Number(income.sum || 0).toLocaleString('he-IL')} ₪</strong>
        </article>
    )
}

export default SingleIncome