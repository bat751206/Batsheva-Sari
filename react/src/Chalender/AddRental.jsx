import React, { useEffect, useRef, useState } from 'react'
import axios from "axios"

const weekdayLabels = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

const formatDateInput = (date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
}

const formatDateLabel = (date) => new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(date)

const AddRental = ({ setShowAddRental, selectedDate ,onRentalAdded}) => {
    const initialDate = selectedDate || new Date()
    const [date, setDate] = useState(initialDate)
    const [visibleMonth, setVisibleMonth] = useState(() => (
        new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
    ))
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const datePickerRef = useRef(null)

    useEffect(() => {
        if (!isCalendarOpen) return undefined

        const closeOnOutsideClick = (event) => {
            if (!datePickerRef.current?.contains(event.target)) setIsCalendarOpen(false)
        }
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setIsCalendarOpen(false)
        }

        document.addEventListener('mousedown', closeOnOutsideClick)
        document.addEventListener('keydown', closeOnEscape)
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick)
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [isCalendarOpen])

    const calendarDays = Array.from({ length: 42 }, (_, index) => (
        new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth(),
            1 - new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay() + index,
        )
    ))
    const monthLabel = new Intl.DateTimeFormat('he-IL', {
        month: 'long',
        year: 'numeric',
    }).format(visibleMonth)
    const today = new Date()

    const addRental = async (e) => {
        e.preventDefault()
        const data = new FormData(e.target)
        const info = Object.fromEntries(data.entries())

        const obj = {
            date: formatDateInput(date),
            numOfBeds: Number(info.numOfBeds),
            numOfBabyBeds: Number(info.numOfBabyBeds),
            numOfNights: Number(info.numOfNights),
            checkPikadon: info.checkPikadon,
            tivuch: info.tivuch,
            sumPayment: Number(info.sum),
            description: (info.description || '').trim(),
            name: (info.renterName || '').trim(),
            phone: (info.renterPhone || '').trim(),
        }
        setIsSubmitting(true)
        setSubmitError('')
        try {
            await axios.post('http://localhost:7200/api/rents', obj)
            setShowAddRental(false)
            onRentalAdded()
        } catch (error) {
            console.error('Failed to add rental', error)
            setSubmitError(error.response?.data?.message || 'לא ניתן לשמור את ההשכרה. בדקי את החיבור לשרת ואת הפרטים.')
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div
            className="calendar-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) setShowAddRental(false)
            }}
        >
            <div className="calendar-modal-panel" role="dialog" aria-modal="true" aria-labelledby="add-rental-title" dir="rtl">
                <form className="add-rental-form" onSubmit={addRental}>
                    <div className="add-rental-header">
                        <div>
                            <span className="add-rental-eyebrow">ניהול השכרות</span>
                            <h2 id="add-rental-title">הוספת השכרה</h2>
                        </div>
                        <button
                            type="button"
                            className="add-rental-close"
                            onClick={() => setShowAddRental(false)}
                            aria-label="סגירת טופס ההשכרה"
                        >×</button>
                    </div>

                    <div className="rental-date-picker rental-form-field" ref={datePickerRef}>
                        <label className="rental-date-label" htmlFor="rental-entry-date">תאריך כניסה</label>
                        <div className="rental-date-control">
                            <input
                                id="rental-entry-date"
                                className="rental-date-input"
                                type="text"
                                value={formatDateLabel(date)}
                                readOnly
                                onClick={() => setIsCalendarOpen((open) => !open)}
                                aria-haspopup="dialog"
                                aria-expanded={isCalendarOpen}
                            />
                            <input type="hidden" name="date" value={formatDateInput(date)} readOnly />
                            <button
                                type="button"
                                className="rental-date-toggle"
                                onClick={() => setIsCalendarOpen((open) => !open)}
                                aria-label="פתיחת לוח שנה"
                                title="פתיחת לוח שנה"
                            >
                                <i className="pi pi-calendar" aria-hidden="true" />
                            </button>
                        </div>

                        {isCalendarOpen && <div className="rental-date-popover" role="dialog" aria-label="בחירת תאריך">
                            <div className="rental-date-header">
                                <button
                                    type="button"
                                    onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                                    aria-label="החודש הקודם"
                                >‹</button>
                                <strong>{monthLabel}</strong>
                                <button
                                    type="button"
                                    onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                                    aria-label="החודש הבא"
                                >›</button>
                            </div>
                            <div className="rental-date-grid rental-date-weekdays" aria-hidden="true">
                                {weekdayLabels.map((day) => <span key={day}>{day}</span>)}
                            </div>
                            <div className="rental-date-grid">
                                {calendarDays.map((day) => {
                                    const isCurrentMonth = day.getMonth() === visibleMonth.getMonth()
                                    const isSelected = formatDateInput(day) === formatDateInput(date)
                                    const isToday = formatDateInput(day) === formatDateInput(today)

                                    return (
                                        <button
                                            key={formatDateInput(day)}
                                            type="button"
                                            className={[
                                                'rental-date-day',
                                                !isCurrentMonth ? 'outside-month' : '',
                                                isSelected ? 'selected' : '',
                                                isToday ? 'today' : '',
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => {
                                                setDate(day)
                                                setVisibleMonth(new Date(day.getFullYear(), day.getMonth(), 1))
                                                setIsCalendarOpen(false)
                                            }}
                                            aria-pressed={isSelected}
                                        >
                                            {day.getDate()}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>}
                    </div>

                    <section className="rental-form-section">
                        <h3>פרטי האירוח</h3>
                        <div className="rental-form-fields rental-form-fields-stay">
                            <label className="rental-form-field">
                                <span>מספר מיטות</span>
                                <input name="numOfBeds" type="number" min="1" required placeholder="למשל 4" />
                            </label>
                            <label className="rental-form-field">
                                <span>מיטות תינוק</span>
                                <input name="numOfBabyBeds" type="number" min="0" defaultValue="0" />
                            </label>
                            <label className="rental-form-field">
                                <span>מספר לילות</span>
                                <input name="numOfNights" type="number" min="1" required placeholder="למשל 2" />
                            </label>
                        </div>
                    </section>

                    <section className="rental-form-section">
                        <h3>פרטי השוכר</h3>
                        <div className="rental-form-fields">
                            <label className="rental-form-field">
                                <span>שם השוכר</span>
                                <input name="renterName" type="text" required placeholder="שם מלא" />
                            </label>
                            <label className="rental-form-field">
                                <span>טלפון</span>
                                <input name="renterPhone" type="tel" required placeholder="מספר טלפון" />
                            </label>
                        </div>
                    </section>

                    <section className="rental-form-section">
                        <h3>תשלום ואפשרויות</h3>
                        <div className="rental-form-fields">
                            <label className="rental-form-field">
                                <span>סכום לתשלום</span>
                                <input name="sum" type="number" min="0" required placeholder="₪" />
                            </label>
                            <label className="rental-form-field rental-form-field-wide">
                                <span>הערות</span>
                                <input name="description" type="text" placeholder="פרטים נוספים (לא חובה)" />
                            </label>
                        </div>
                        <div className="rental-form-options">
                            <label className="rental-option" htmlFor="checkPikadon">
                                <input id="checkPikadon" name="checkPikadon" type="checkbox" />
                                <span>צ׳ק פיקדון</span>
                            </label>
                            <label className="rental-option" htmlFor="tivuch">
                                <input id="tivuch" name="tivuch" type="checkbox" />
                                <span>תיווך</span>
                            </label>
                        </div>
                    </section>

                    {submitError && <p className="rental-form-error" role="alert">{submitError}</p>}
                    <div className="rental-form-actions">
                        <button type="button" className="rental-form-cancel" onClick={() => setShowAddRental(false)}>
                            ביטול
                        </button>
                        <button type="submit" className="rental-form-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'שומר...' : 'שמירת השכרה'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddRental