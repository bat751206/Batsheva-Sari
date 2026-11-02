import { HDate } from '@hebcal/hdate'
import './SignalRental.css'

export const formatHebrewDate = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'תאריך לא זמין' : new HDate(date).renderGematriya().trim()
}

const formatAmount = (amount) => {
    const numericAmount = Number(amount)
    return Number.isFinite(numericAmount)
        ? new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(numericAmount)
        : 'לא צוין'
}

const SignalRental = ({ rental }) => {
    if (!rental) return <p className="signal-rental-empty">אין פרטי השכרה להצגה</p>

    const renter = rental.renter || {}
    const details = [
        ['טלפון', renter.phone || 'לא צוין'],
        ['מייל', renter.email || 'לא צוין'],
        ['עיר', renter.city || 'לא צוינה'],
        ['מקור הפניה', renter.advertisement || 'לא צוין'],
        ['מספר לילות', rental.numOfNights ?? 'לא צוין'],
        ['מספר מיטות', rental.numOfBeds ?? 'לא צוין'],
        ['מיטות תינוק', rental.numOfBabyBeds ?? 0],
        ['סכום לתשלום', formatAmount(rental.sumPayment)],
        ['סטטוס תשלום', rental.isPaid ? 'שולם' : 'טרם שולם'],
        ['אמצעי תשלום', rental.paymentType || 'לא צוין'],
        ['צ׳ק פיקדון', rental.checkPikadon ? 'כן' : 'לא'],
        ['תיווך', rental.tivuch ? 'כן' : 'לא'],
    ]

    return (
        <article className="signal-rental" dir="rtl">
            <h2 className="signal-rental-title">פרטי השוכר וההשכרה</h2>
            <dl className="signal-rental-details">
                {details.map(([label, value]) => (
                    <div className="signal-rental-detail" key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
                {rental.description && <div className="signal-rental-detail signal-rental-description">
                    <dt>הערות</dt>
                    <dd>{rental.description}</dd>
                </div>}
            </dl>
        </article>
    )
}

export default SignalRental