import { useEffect, useState } from 'react'
import axios from 'axios'
import { HDate, isLeapYear } from '@hebcal/hdate'
import SignalRental, { formatHebrewDate } from './SignalRental'

const hebrewDayLetters = {
  1: 'א׳', 2: 'ב׳', 3: 'ג׳', 4: 'ד׳', 5: 'ה׳', 6: 'ו׳', 7: 'ז׳', 8: 'ח׳', 9: 'ט׳',
  10: 'י׳', 11: 'יא׳', 12: 'יב׳', 13: 'יג׳', 14: 'יד׳', 15: 'טו׳', 16: 'טז׳', 17: 'יז׳', 18: 'יח׳', 19: 'יט׳',
  20: 'כ׳', 21: 'כא׳', 22: 'כב׳', 23: 'כג׳', 24: 'כד׳', 25: 'כה׳', 26: 'כו׳', 27: 'כז׳', 28: 'כח׳', 29: 'כט׳', 30: 'ל׳',
}

const hebrewMonthNames = {
  1: 'ניסן', 2: 'אייר', 3: 'סיוון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
  7: 'תשרי', 8: 'חשוון', 9: 'כסלו', 10: 'טבת', 11: 'שבט',
}

const getHebrewMonthName = (month, year) => {
  if (month === 12) return isLeapYear(year) ? 'אדר א׳' : 'אדר'
  if (month === 13) return 'אדר ב׳'
  return hebrewMonthNames[month] || ''
}

const getHebrewMonthsInYear = (year) => (
  isLeapYear(year)
    ? [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6]
    : [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6]
)

const formatGregorianDate = (date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toLocalDate = (hebrewDate) => {
  const date = hebrewDate.greg()
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const ShowRentalHistory = () => {
  const [rentals, setRentals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [expandedRentalId, setExpandedRentalId] = useState(null)
  const [searchMode, setSearchMode] = useState('name')
  const [dateCalendar, setDateCalendar] = useState('hebrew')
  const [searchTerm, setSearchTerm] = useState('')
  const [gregorianDateValue, setGregorianDateValue] = useState('')
  const [hebrewDateValue, setHebrewDateValue] = useState(() => {
    const today = new HDate(new Date())
    return { day: today.getDate(), month: today.getMonth(), year: today.getFullYear() }
  })

  useEffect(() => {
    let isActive = true

    const loadRentals = async () => {
      try {
        const { data } = await axios.get('http://localhost:7200/api/rents')
        if (isActive) setRentals(Array.isArray(data) ? data : [])
      } catch (error) {
        if (isActive) setLoadError(error.response?.data?.message || 'לא ניתן לטעון את ההשכרות כרגע')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadRentals()
    return () => {
      isActive = false
    }
  }, [])

  const sortedRentals = [...rentals].sort((first, second) => (
    new Date(second.date || 0).getTime() - new Date(first.date || 0).getTime()
  ))

  const updateHebrewDate = (value) => {
    const year = value.year
    const months = getHebrewMonthsInYear(year)
    const month = months.includes(value.month) ? value.month : 12
    const lastDay = new HDate(1, month, year).daysInMonth()
    setHebrewDateValue({ year, month, day: Math.min(value.day, lastDay) })
  }

  const applyDateSearch = () => {
    if (dateCalendar === 'hebrew') {
      const { day, month, year } = hebrewDateValue
      setSearchTerm(formatHebrewDate(toLocalDate(new HDate(day, month, year))))
      return
    }
    setSearchTerm(gregorianDateValue)
  }

  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase()
  const normalizedHebrewSearch = normalizedSearchTerm.replace(/[\u05f3\u05f4'"\s]/g, '')
  const filteredRentals = sortedRentals.filter((rental) => {
    if (!normalizedSearchTerm) return true
    if (searchMode === 'name') {
      return String(rental.renter?.name || '').toLocaleLowerCase().includes(normalizedSearchTerm)
    }
    if (dateCalendar === 'gregorian') {
      return String(rental.date || '').slice(0, 10) === searchTerm.trim()
    }
    const rentalHebrewDate = formatHebrewDate(rental.date)
        .toLocaleLowerCase()
        .replace(/[\u05f3\u05f4'"\s]/g, '')
    return rentalHebrewDate.includes(normalizedHebrewSearch)
  })

  return (
    <main className="show-rental-history" dir="rtl">
      <header className="show-rental-history-header">
        <div>
          <h1>היסטוריית השכרות</h1>
          <p>כל ההשכרות השמורות במערכת</p>
        </div>
        {!isLoading && !loadError && <span className="show-rental-history-count">{filteredRentals.length}</span>}
      </header>

      {isLoading ? <p className="show-rental-history-state" aria-live="polite">טוען השכרות...</p>
        : loadError ? <p className="show-rental-history-state" role="alert">{loadError}</p>
          : <>
            <section className="rental-history-search" aria-label="חיפוש השכרות">
              <div className="rental-history-search-options" role="group" aria-label="סוג חיפוש">
                <button
                  type="button"
                  aria-pressed={searchMode === 'name'}
                  onClick={() => {
                    setSearchMode('name')
                    setSearchTerm('')
                  }}
                >
                  שם שוכר
                </button>
                <button
                  type="button"
                  aria-pressed={searchMode === 'date'}
                  onClick={() => {
                    setSearchMode('date')
                    setSearchTerm('')
                  }}
                >
                  תאריך כניסה
                </button>
              </div>

              {searchMode === 'date' && <div className="rental-history-search-options rental-history-calendar-options" role="group" aria-label="לוח שנה לתאריך">
                <button
                  type="button"
                  aria-pressed={dateCalendar === 'hebrew'}
                  onClick={() => {
                    setDateCalendar('hebrew')
                    setSearchTerm('')
                  }}
                >
                  עברי
                </button>
                <button
                  type="button"
                  aria-pressed={dateCalendar === 'gregorian'}
                  onClick={() => {
                    setDateCalendar('gregorian')
                    setSearchTerm('')
                  }}
                >
                  לועזי
                </button>
              </div>}

              {searchMode === 'name' ? <label className="rental-history-search-field" htmlFor="rental-history-search-input">
                <span>חיפוש לפי שם שוכר</span>
                <input
                  id="rental-history-search-input"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="הקלידי שם שוכר"
                />
              </label> : <form className="rental-history-date-jump" onSubmit={(event) => {
                event.preventDefault()
                applyDateSearch()
              }}>
                {dateCalendar === 'hebrew' ? <>
                  <label>
                    יום
                    <select
                      value={hebrewDateValue.day}
                      onChange={(event) => updateHebrewDate({ ...hebrewDateValue, day: Number(event.target.value) })}
                    >
                      {Array.from({ length: new HDate(1, hebrewDateValue.month, hebrewDateValue.year).daysInMonth() }, (_, index) => index + 1)
                        .map((day) => <option key={day} value={day}>{hebrewDayLetters[day]}</option>)}
                    </select>
                  </label>
                  <label>
                    חודש
                    <select
                      value={hebrewDateValue.month}
                      onChange={(event) => updateHebrewDate({ ...hebrewDateValue, month: Number(event.target.value) })}
                    >
                      {getHebrewMonthsInYear(hebrewDateValue.year).map((month) => (
                        <option key={month} value={month}>{getHebrewMonthName(month, hebrewDateValue.year)}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    שנה עברית
                    <input
                      type="number"
                      min="1"
                      value={hebrewDateValue.year}
                      onChange={(event) => {
                        const year = Number(event.target.value)
                        if (year > 0) updateHebrewDate({ ...hebrewDateValue, year })
                      }}
                    />
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
                <button type="submit" disabled={dateCalendar === 'gregorian' && !gregorianDateValue}>הצג תאריך</button>
              </form>}
            </section>

            {filteredRentals.length > 0 ? <section className="show-rental-history-list" aria-label="רשימת השכרות">
            {filteredRentals.map((rental) => {
              const isExpanded = expandedRentalId === rental._id
              const detailsId = `rental-details-${rental._id}`

              return <article className="rental-history-row" key={rental._id}>
                <button
                  className="rental-history-row-toggle"
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={detailsId}
                  onClick={() => setExpandedRentalId(isExpanded ? null : rental._id)}
                >
                  <span className="rental-history-row-main">
                    <strong>{rental.renter?.name || 'שם השוכר לא זמין'}</strong>
                    <span>{formatHebrewDate(rental.date)}</span>
                  </span>
                  <span className="rental-history-row-indicator" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                </button>
                {isExpanded && <div id={detailsId} className="rental-history-row-details">
                  <SignalRental rental={rental} />
                </div>}
              </article>
            })}
          </section>
              : <p className="show-rental-history-state">{rentals.length > 0 ? 'לא נמצאו השכרות תואמות' : 'לא נמצאו השכרות'}</p>}
          </>}
    </main>
  )
}

export default ShowRentalHistory