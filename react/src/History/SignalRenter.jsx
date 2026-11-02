import { useState } from 'react'
import { formatHebrewDate } from './SignalRental'
import './SignalRental.css'

const formatAmount = (amount) => {
  const numericAmount = Number(amount)
  return Number.isFinite(numericAmount)
    ? new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(numericAmount)
    : 'לא צוין'
}

const SignalRenter = ({ renter, rentals = [] }) => {
  const [isRentalsExpanded, setIsRentalsExpanded] = useState(false)
  const sortedRentals = [...rentals].sort((first, second) => (
    new Date(second.date || 0).getTime() - new Date(first.date || 0).getTime()
  ))
  const rentalsListId = `renter-rentals-${renter._id}`

  return (
    <section className="signal-renter" dir="rtl">
      <h2 className="signal-rental-title">פרטי השוכר</h2>
      <dl className="signal-rental-details signal-renter-details">
        <div className="signal-rental-detail">
          <dt>מייל</dt>
          <dd>{renter.email || 'לא צוין'}</dd>
        </div>
        <div className="signal-rental-detail">
          <dt>עיר</dt>
          <dd>{renter.city || 'לא צוינה'}</dd>
        </div>
        <div className="signal-rental-detail">
          <dt>מקור הפניה</dt>
          <dd>{renter.advertisement || 'לא צוין'}</dd>
        </div>
      </dl>

      <h3 className="signal-renter-rentals-heading">
        <button
          className="signal-renter-rentals-toggle"
          type="button"
          aria-expanded={isRentalsExpanded}
          aria-controls={rentalsListId}
          onClick={() => setIsRentalsExpanded((expanded) => !expanded)}
        >
          <span>השכרות</span>
          <span className="signal-renter-rentals-count">{rentals.length}</span>
          <span className="signal-renter-rentals-indicator" aria-hidden="true">{isRentalsExpanded ? '−' : '+'}</span>
        </button>
      </h3>
      <div id={rentalsListId} className="signal-renter-rentals-content" hidden={!isRentalsExpanded}>
        {sortedRentals.length > 0 ? <ul className="signal-renter-rentals">
          {sortedRentals.map((rental) => (
            <li className="signal-renter-rental" key={rental._id}>
              <strong>{formatHebrewDate(rental.date)}</strong>
              <span>{rental.numOfNights} לילות</span>
              <span>{rental.numOfBeds} מיטות</span>
              <span>{formatAmount(rental.sumPayment)}</span>
              <span className={rental.isPaid ? 'signal-renter-paid' : 'signal-renter-unpaid'}>
                {rental.isPaid ? 'שולם' : 'טרם שולם'}
              </span>
            </li>
          ))}
        </ul> : <p className="signal-renter-empty">אין השכרות לשוכר זה</p>}
      </div>
    </section>
  )
}

export default SignalRenter