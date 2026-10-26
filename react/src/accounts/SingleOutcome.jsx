import React from 'react'

const formatDate = (value) => {
    if (!value) return '—'
    const [year, month, day] = String(value).slice(0, 10).split('-')
    return year && month && day ? `${day}/${month}/${year}` : String(value)
}

const SingleOutcome = ({ outcome }) => (
    <article className="expense-item">
        <span className="expense-item-icon"><i className="pi pi-arrow-up-right" aria-hidden="true" /></span>
        <div className="expense-item-description">
            <strong>{outcome.description || 'הוצאה ללא תיאור'}</strong>
            <span>{formatDate(outcome.date)}</span>
        </div>
        <span className="expense-payment-type">{outcome.paymentType || 'לא צוין אמצעי תשלום'}</span>
        <strong className="expense-item-amount">{Number(outcome.sum || 0).toLocaleString('he-IL')} ₪</strong>
    </article>
)

export default SingleOutcome
