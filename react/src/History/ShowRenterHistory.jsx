import { useEffect, useState } from 'react'
import axios from 'axios'
import SignalRenter from './SignalRenter'

const ShowRenterHistory = () => {
  const [renters, setRenters] = useState([])
  const [rentals, setRentals] = useState([])
  const [expandedRenterId, setExpandedRenterId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchMode, setSearchMode] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let isActive = true

    const loadHistory = async () => {
      try {
        const [{ data: renterData }, { data: rentalData }] = await Promise.all([
          axios.get('http://localhost:7200/api/renters'),
          axios.get('http://localhost:7200/api/rents'),
        ])
        if (isActive) {
          setRenters(Array.isArray(renterData) ? renterData : [])
          setRentals(Array.isArray(rentalData) ? rentalData : [])
        }
      } catch (error) {
        if (isActive) setLoadError(error.response?.data?.message || 'לא ניתן לטעון את השוכרים כרגע')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadHistory()
    return () => {
      isActive = false
    }
  }, [])

  const rentalsByRenter = new Map()
  rentals.forEach((rental) => {
    const renterId = String(typeof rental.renter === 'object' ? rental.renter?._id || '' : rental.renter || '')
    if (!renterId) return
    if (!rentalsByRenter.has(renterId)) rentalsByRenter.set(renterId, [])
    rentalsByRenter.get(renterId).push(rental)
  })

  const sortedRenters = [...renters].sort((first, second) => (
    String(first.name || '').localeCompare(String(second.name || ''), 'he')
  ))
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase()
  const normalizedPhoneSearch = searchTerm.replace(/\D/g, '')
  const filteredRenters = sortedRenters.filter((renter) => {
    if (!normalizedSearchTerm) return true
    if (searchMode === 'phone') {
      if (!normalizedPhoneSearch) return false
      return String(renter.phone || '').replace(/\D/g, '').includes(normalizedPhoneSearch)
    }
    return String(renter.name || '').toLocaleLowerCase().includes(normalizedSearchTerm)
  })

  return (
    <main className="show-rental-history" dir="rtl">
      <header className="show-rental-history-header">
        <div>
          <h1>היסטוריית שוכרים</h1>
          <p>לחצי על שוכר כדי לראות את פרטיו ואת ההשכרות שלו</p>
        </div>
        {!isLoading && !loadError && <span className="show-rental-history-count">{filteredRenters.length}</span>}
      </header>

      {isLoading ? <p className="show-rental-history-state" aria-live="polite">טוען שוכרים...</p>
        : loadError ? <p className="show-rental-history-state" role="alert">{loadError}</p>
          : <>
            <section className="rental-history-search" aria-label="חיפוש שוכרים">
              <div className="rental-history-search-options" role="group" aria-label="חיפוש לפי">
                <button
                  type="button"
                  aria-pressed={searchMode === 'name'}
                  onClick={() => {
                    setSearchMode('name')
                    setSearchTerm('')
                  }}
                >
                  שם
                </button>
                <button
                  type="button"
                  aria-pressed={searchMode === 'phone'}
                  onClick={() => {
                    setSearchMode('phone')
                    setSearchTerm('')
                  }}
                >
                  טלפון
                </button>
              </div>
              <label className="rental-history-search-field" htmlFor="renter-history-search-input">
                <input
                  id="renter-history-search-input"
                  type={searchMode === 'phone' ? 'tel' : 'search'}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={searchMode === 'name' ? 'הקלידי שם שוכר' : 'הקלידי מספר טלפון'}
                />
              </label>
            </section>

            {filteredRenters.length > 0 ? <section className="show-rental-history-list" aria-label="רשימת שוכרים">
            {filteredRenters.map((renter) => {
              const renterId = String(renter._id)
              const isExpanded = expandedRenterId === renterId
              const detailsId = `renter-details-${renterId}`

              return <article className="rental-history-row" key={renterId}>
                <button
                  className="rental-history-row-toggle"
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={detailsId}
                  onClick={() => setExpandedRenterId(isExpanded ? null : renterId)}
                >
                  <span className="rental-history-row-main">
                    <strong>{renter.name || 'שם שוכר לא זמין'}</strong>
                    <span>{renter.phone || 'טלפון לא זמין'}</span>
                  </span>
                  <span className="rental-history-row-indicator" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                </button>
                {isExpanded && <div id={detailsId} className="rental-history-row-details">
                  <SignalRenter renter={renter} rentals={rentalsByRenter.get(renterId) || []} />
                </div>}
              </article>
            })}
          </section>
              : <p className="show-rental-history-state">{renters.length > 0 ? 'לא נמצאו שוכרים תואמים' : 'לא נמצאו שוכרים'}</p>}
          </>}
    </main>
  )
}

export default ShowRenterHistory