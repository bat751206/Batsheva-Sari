import React, { useEffect, useMemo, useState } from 'react'
import { calendar, Location } from '@hebcal/core'
import { HDate, isLeapYear } from '@hebcal/hdate'
import './RentCalendar.css'
import axios from 'axios'
import AddRental from './AddRental'
const weekdayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

const hebrewDayLetters = {
    1: 'א׳', 2: 'ב׳', 3: 'ג׳', 4: 'ד׳', 5: 'ה׳', 6: 'ו׳', 7: 'ז׳', 8: 'ח׳', 9: 'ט׳',
    10: 'י׳', 11: 'יא׳', 12: 'יב׳', 13: 'יג׳', 14: 'יד׳', 15: 'טו׳', 16: 'טז׳', 17: 'יז׳', 18: 'יח׳', 19: 'יט׳',
    20: 'כ׳', 21: 'כא׳', 22: 'כב׳', 23: 'כג׳', 24: 'כד׳', 25: 'כה׳', 26: 'כו׳', 27: 'כז׳', 28: 'כח׳', 29: 'כט׳', 30: 'ל׳'
}

const hebrewMonthNames = {
    1: 'ניסן', 2: 'אייר', 3: 'סיוון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
    7: 'תשרי', 8: 'חשוון', 9: 'כסלו', 10: 'טבת', 11: 'שבט',
}

const getHebrewMonthName = (hebrewDate) => {
    const month = hebrewDate.getMonth()
    if (month === 12) return isLeapYear(hebrewDate.getFullYear()) ? 'אדר א׳' : 'אדר'
    if (month === 13) return 'אדר ב׳'
    return hebrewMonthNames[month] || ''
}

const getHebrewMonthsInYear = (year) => (
    isLeapYear(year)
        ? [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6]
        : [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6]
)

const getHebrewYearLabel = (hebrewDate) => hebrewDate.renderGematriya().trim().split(/\s+/).at(-1)

const formatDateInput = (date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
}

const toLocalDate = (hebrewDate) => {
    const date = hebrewDate.greg()
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const buildMonthGrid = (date) => {
    const hebrewDate = new HDate(date)
    const firstDay = toLocalDate(new HDate(1, hebrewDate.getMonth(), hebrewDate.getFullYear()))
    const gridStart = new Date(firstDay)
    gridStart.setDate(firstDay.getDate() - firstDay.getDay())

    const cells = []
    for (let i = 0; i < 42; i += 1) {
        const nextDate = new Date(gridStart)
        nextDate.setDate(gridStart.getDate() + i)
        cells.push(nextDate)
    }

    return cells
}

const removeNikud = (text) => text.replace(/[\u0591-\u05C7]/g, '')

const getShabbatAndHolidayData = (dates, locationName) => {
    const years = [...new Set(dates.map((date) => date.getFullYear()))]
    const events = years.flatMap((year) => calendar({
        year,
        isHebrewYear: false,
        candlelighting: true,
        location: Location.lookup(locationName),
        sedrot: true,
        il: true,
    }))
    const dataByDate = new Map()

    const getEntry = (absDate) => {
        if (!dataByDate.has(absDate)) {
            dataByDate.set(absDate, {
                holidayNames: [],
                isCholHamoed: false,
                isFast: false,
                parsha: '',
                candleTime: '',
                havdalahTime: '',
            })
        }
        return dataByDate.get(absDate)
    }

    events.forEach((event) => {
        const categories = event.getCategories()
        const flags = event.flagNames()
        const eventDate = event.getDate().abs()
        const eventLabel = removeNikud(event.render('he'))
        const eventName = event.render('en').toLowerCase()

        if (categories.includes('modern')) return
        if (eventName === 'chag habanot' || eventName === 'rosh hashana labehemot') return

        if (flags.includes('LIGHT_CANDLES')) {
            getEntry(eventDate + 1).candleTime = event.eventTimeStr
        }
        if (flags.includes('LIGHT_CANDLES_TZEIS')) {
            getEntry(eventDate).havdalahTime = event.eventTimeStr
        }

        const entry = getEntry(eventDate)
        if (categories.includes('parashat')) entry.parsha = removeNikud(event.render('he'))
        if (categories.includes('cholhamoed')) entry.isCholHamoed = true
        if (categories.includes('fast') && !flags.includes('CHAG')) entry.isFast = true
        if (categories.includes('holiday') && !entry.holidayNames.includes(eventLabel)) {
            entry.holidayNames.push(eventLabel)
        }
    })

    return dataByDate
}

const getHebrewDate = (gregorianDate, dayData) => {
    const hebrew = new HDate(gregorianDate)
    const month = getHebrewMonthName(hebrew)
    const holiday = dayData?.holidayNames.join(' · ') || null

    return {
        day: hebrew.getDate(),
        month,
        display: `${hebrewDayLetters[hebrew.getDate()] || hebrew.getDate()} ${month} ${getHebrewYearLabel(hebrew)}`,
        holiday,
        dayLabel: hebrewDayLetters[hebrew.getDate()] || `${hebrew.getDate()}`,
        dayData,
    }
}

const RentCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [locationName, setLocationName] = useState('Jerusalem')
    const [rentals, setRentals] = useState([])
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const [datePickerMode, setDatePickerMode] = useState('hebrew')
    const [gregorianDateValue, setGregorianDateValue] = useState(() => formatDateInput(new Date()))
    const [datePickerValue, setDatePickerValue] = useState(() => {
        const today = new HDate(new Date())
        return { day: today.getDate(), month: today.getMonth(), year: today.getFullYear() }
    })
    //
    const [showAddRental, setShowAddRental] = useState(false)

    const calendarDays = useMemo(() => buildMonthGrid(currentMonth), [currentMonth])
    const dayDataByDate = useMemo(
        () => getShabbatAndHolidayData(calendarDays, locationName),
        [calendarDays, locationName],
    )
    const rentalsByDate = useMemo(() => {
        const dateMap = new Map()

        rentals.forEach((rental) => {
            const startDateValue = String(rental.date || '').slice(0, 10)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(startDateValue)) return

            const [year, month, day] = startDateValue.split('-').map(Number)
            const startDate = new Date(year, month - 1, day, 12)
            const nights = Math.floor(Number(rental.numOfNights))
            if (!Number.isFinite(startDate.getTime()) || nights < 1) return

            for (let offset = 0; offset < nights; offset += 1) {
                const occupiedDate = new Date(startDate)
                occupiedDate.setDate(startDate.getDate() + offset)
                const dateKey = formatDateInput(occupiedDate)
                if (!dateMap.has(dateKey)) dateMap.set(dateKey, [])
                dateMap.get(dateKey).push(rental)
            }
        })

        return dateMap
    }, [rentals])
    const currentHebrewMonth = new HDate(currentMonth)
    const monthLabel = `${getHebrewMonthName(currentHebrewMonth)} ${getHebrewYearLabel(currentHebrewMonth)}`
    const selectedHebrew = getHebrewDate(selectedDate, dayDataByDate.get(new HDate(selectedDate).abs()))

    const changeMonth = (months) => {
        const firstDay = new HDate(1, currentHebrewMonth.getMonth(), currentHebrewMonth.getFullYear())
        setCurrentMonth(toLocalDate(firstDay.add(months, 'months')))
    }

    const changeSelectedDay = (days) => {
        const nextDate = new Date(selectedDate)
        nextDate.setDate(nextDate.getDate() + days)
        setSelectedDate(nextDate)
        setCurrentMonth(nextDate)
    }

    const goToToday = () => {
        const today = new Date()
        setSelectedDate(today)
        setCurrentMonth(today)
    }

    const updateDatePicker = (value) => {
        const year = value.year
        const months = getHebrewMonthsInYear(year)
        const month = months.includes(value.month) ? value.month : 12
        const lastDay = new HDate(1, month, year).daysInMonth()
        setDatePickerValue({ year, month, day: Math.min(value.day, lastDay) })
    }

    const goToPickedDate = (event) => {
        event.preventDefault()
        const date = datePickerMode === 'hebrew'
            ? toLocalDate(new HDate(datePickerValue.day, datePickerValue.month, datePickerValue.year))
            : (() => {
                const [year, month, day] = gregorianDateValue.split('-').map(Number)
                return new Date(year, month - 1, day)
            })()
        setSelectedDate(date)
        setCurrentMonth(date)
        setIsDatePickerOpen(false)
    }

    useEffect(() => {
        const handleCalendarKeyDown = (event) => {
            if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return

            const dayOffsets = {
                ArrowRight: -1,
                ArrowLeft: 1,
                ArrowUp: -7,
                ArrowDown: 7,
            }
            const dayOffset = dayOffsets[event.key]
            if (dayOffset === undefined) return

            event.preventDefault()
            changeSelectedDay(dayOffset)
        }

        window.addEventListener('keydown', handleCalendarKeyDown)
        return () => window.removeEventListener('keydown', handleCalendarKeyDown)
    }, [selectedDate])

    const isSelected = (date) => (
        date.getDate() === selectedDate.getDate() &&
        new HDate(date).abs() === new HDate(selectedDate).abs()
    )

    const isCurrentMonth = (date) => {
        const hebrewDate = new HDate(date)
        return hebrewDate.getMonth() === currentHebrewMonth.getMonth() &&
            hebrewDate.getFullYear() === currentHebrewMonth.getFullYear()
    }

    useEffect(() => {
        let isMounted = true

        const getAllRentals = async () => {
            try {
                const response = await axios.get('http://localhost:7200/api/rents')
                if (isMounted) setRentals(Array.isArray(response.data) ? response.data : [])
            } catch (error) {
                console.error('Failed to load rentals', error)
            }
        }

        getAllRentals()
        return () => {
            isMounted = false
        }
    }, [])

    return (
        <div className="calendar-page" dir="rtl">
            <div className="calendar-card">
                <div className="calendar-header">
                    <div>
                        <p className="calendar-kicker">תאריך עברי</p>
                        <h2>{monthLabel}</h2>
                        <label className="location-select">
                            זמני שבת לפי עיר
                            <select value={locationName} onChange={(event) => setLocationName(event.target.value)}>
                                <option value="Jerusalem">ירושלים</option>
                                <option value="Tel Aviv">תל אביב</option>
                                <option value="Haifa">חיפה</option>
                                <option value="Beer Sheva">באר שבע</option>
                                <option value="Ashdod">אשדוד</option>
                                <option value="Eilat">אילת</option>
                                <option value="Tiberias">טבריה</option>
                            </select>
                        </label>
                    </div>

                    <div className="calendar-nav">
                        <button type="button" onClick={goToToday} aria-label="חזרה להיום" title="חזרה להיום">היום</button>
                        <button
                            type="button"
                            onClick={() => {
                                const hebrewDate = new HDate(selectedDate)
                                updateDatePicker({ day: hebrewDate.getDate(), month: hebrewDate.getMonth(), year: hebrewDate.getFullYear() })
                                setGregorianDateValue(formatDateInput(selectedDate))
                                setIsDatePickerOpen((isOpen) => !isOpen)
                            }}
                            aria-expanded={isDatePickerOpen}
                            aria-label="מעבר לתאריך"
                        >
                            מעבר לתאריך
                        </button>
                        <button type="button" onClick={() => changeSelectedDay(-1)} aria-label="יום קודם" title="יום קודם">יום קודם ←</button>
                        <button type="button" onClick={() => changeMonth(-1)} aria-label="החודש העברי הקודם" title="החודש העברי הקודם">חודש קודם ‹</button>
                        <button type="button" onClick={() => changeSelectedDay(1)} aria-label="יום הבא" title="יום הבא">יום הבא →</button>
                        <button type="button" onClick={() => changeMonth(1)} aria-label="החודש העברי הבא" title="החודש העברי הבא">חודש הבא ›</button>
                    </div>
                </div>

                {isDatePickerOpen && <form className="date-jump" onSubmit={goToPickedDate}>
                    <div className="date-jump-mode" role="group" aria-label="סוג התאריך">
                        <button type="button" aria-pressed={datePickerMode === 'hebrew'} onClick={() => setDatePickerMode('hebrew')}>עברי</button>
                        <button type="button" aria-pressed={datePickerMode === 'gregorian'} onClick={() => setDatePickerMode('gregorian')}>לועזי</button>
                    </div>
                    {datePickerMode === 'hebrew' ? <>
                        <label>
                            יום
                            <select
                                value={datePickerValue.day}
                                onChange={(event) => updateDatePicker({ ...datePickerValue, day: Number(event.target.value) })}
                            >
                                {Array.from({ length: new HDate(1, datePickerValue.month, datePickerValue.year).daysInMonth() }, (_, index) => index + 1)
                                    .map((day) => <option key={day} value={day}>{hebrewDayLetters[day]}</option>)}
                            </select>
                        </label>
                        <label>
                            חודש
                            <select
                                value={datePickerValue.month}
                                onChange={(event) => updateDatePicker({ ...datePickerValue, month: Number(event.target.value) })}
                            >
                                {getHebrewMonthsInYear(datePickerValue.year).map((month) => (
                                    <option key={month} value={month}>
                                        {getHebrewMonthName(new HDate(1, month, datePickerValue.year))}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            שנה עברית
                            <input
                                type="number"
                                min="1"
                                value={datePickerValue.year}
                                onChange={(event) => {
                                    const year = Number(event.target.value)
                                    if (year > 0) updateDatePicker({ ...datePickerValue, year })
                                }}
                            />
                            <span className="date-year-hebrew">
                                {getHebrewYearLabel(new HDate(datePickerValue.day, datePickerValue.month, datePickerValue.year))}
                            </span>
                        </label>
                    </> : <label>
                        תאריך לועזי
                        <input
                            type="date"
                            value={gregorianDateValue}
                            onChange={(event) => setGregorianDateValue(event.target.value)}
                            required
                        />
                    </label>}
                    <button type="submit">הצג תאריך</button>
                </form>}

                <div className="calendar-status">
                    <div className="selected-date-summary">
                        <span className="summary-label">התאריך העברי הנבחר</span>
                        <strong>{selectedHebrew.display}</strong>
                        {selectedHebrew.holiday && <span className="holiday-label-inline">{selectedHebrew.holiday}</span>}
                        {selectedDate.getDay() === 6 && <div className="selected-shabbat-details">
                            {selectedHebrew.dayData?.parsha && <span>{selectedHebrew.dayData.parsha}</span>}
                            {selectedHebrew.dayData?.candleTime && <span>כניסת שבת: {selectedHebrew.dayData.candleTime}</span>}
                            {selectedHebrew.dayData?.havdalahTime && <span>יציאת שבת: {selectedHebrew.dayData.havdalahTime}</span>}
                        </div>}
                    </div>
                </div>

                <div className="calendar-grid">
                    {weekdayNames.map((day) => (
                        <div key={day} className="day-name">
                            <span>{day}</span>
                        </div>
                    ))}

                    {calendarDays.map((date, index) => {
                        const dayData = dayDataByDate.get(new HDate(date).abs())
                        const hebrew = getHebrewDate(date, dayData)
                        const isToday = date.toDateString() === new Date().toDateString()
                        const selected = isSelected(date)
                        const holidayClass = hebrew.holiday ? 'holiday' : ''
                        const isShabbat = date.getDay() === 6
                        const hasRental = rentalsByDate.has(formatDateInput(date))
                        const dayTitle = [
                            hebrew.holiday || hebrew.display,
                            hasRental ? 'יש השכרה בתאריך זה' : '',
                        ].filter(Boolean).join(' · ')

                        return (
                            <button
                                key={`${date.toISOString()}-${index}`}
                                type="button"
                                className={[
                                    'calendar-day',
                                    !isCurrentMonth(date) ? 'muted' : '',
                                    isToday ? 'today' : '',
                                    selected ? 'selected' : '',
                                    holidayClass,
                                    isShabbat ? 'shabbat' : '',
                                    dayData?.isCholHamoed ? 'chol-hamoed' : '',
                                    dayData?.isFast ? 'fast' : '',
                                    hasRental ? 'rental' : '',
                                ].join(' ')}
                                onClick={() => {

                                    setSelectedDate(date)
                                    setShowAddRental(!showAddRental)

                                    if (!isCurrentMonth(date)) setCurrentMonth(date)

                                }}
                                title={dayTitle}
                            >
                                <span className="gregorian-day">{date.getDate()}</span>
                                <span className="hebrew-day">{hebrew.dayLabel}</span>
                                {hebrew.holiday && <span className="holiday-tag">{hebrew.holiday}</span>}
                                {isShabbat && <span className="shabbat-details">
                                    {dayData?.parsha && <span>{dayData.parsha}</span>}
                                    {dayData?.candleTime && <span>כניסה {dayData.candleTime}</span>}
                                    {dayData?.havdalahTime && <span>יציאה {dayData.havdalahTime}</span>}
                                </span>}
                            </button>
                        )
                    })}

                    {showAddRental && <AddRental selectedDate={selectedDate} setShowAddRental={setShowAddRental} />}

                </div>
            </div>
        </div>
    )
}

export default RentCalendar
