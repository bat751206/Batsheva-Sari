import React from 'react'

const ShowCurrentRental = ({setShowRentalDetails,selectedHebrew,rentalsByDate,formatDateInput,selectedDate  }) => {
    return (
        <div
            className="calendar-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) setShowRentalDetails(false)
            }}
        >
            <div className="calendar-modal-panel" role="dialog" aria-modal="true" aria-labelledby="rental-details-title" dir="rtl">
                <section className="calendar-rental-details" aria-live="polite">
                    <div className="calendar-rental-details-header">
                        <h3 id="rental-details-title">השכרה לתאריך {selectedHebrew.display}</h3>
                        <button type="button" onClick={() => setShowRentalDetails(false)} aria-label="סגירת פרטי ההשכרה">×</button>
                    </div>
                    <div className="calendar-rental-list">
                        {(rentalsByDate.get(formatDateInput(selectedDate)) || []).map((rental, rentalIndex) => (
                            <article className="calendar-rental-item" key={rental._id || rentalIndex}>
                                <strong>{rental.renter?.name || 'שם השוכר לא זמין'}</strong>
                                <p>תאריך כניסה: {String(rental.date || '').slice(0, 10)}</p>
                                <p>מספר לילות: {rental.numOfNights}</p>
                                <p>מספר מיטות: {rental.numOfBeds}</p>
                                {rental.numOfBabyBeds > 0 && <p>מיטות תינוק: {rental.numOfBabyBeds}</p>}
                                {rental.sumPayment != null && <p>סכום לתשלום: {rental.sumPayment}</p>}
                                {rental.description && <p>{rental.description}</p>}
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ShowCurrentRental