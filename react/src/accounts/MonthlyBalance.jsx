import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './MonthlyBalance.css'

const formatMonthValue = (date) => (
    `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`
)

const MonthlyBalance = () => {
    const [incomes, setIncomes] = useState([])
    const [outcomes, setOutcomes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [periodMode, setPeriodMode] = useState('monthly')
    const [selectedMonth, setSelectedMonth] = useState(() => formatMonthValue(new Date()))
    const [selectedAnnualYear, setSelectedAnnualYear] = useState(() => new Date().getFullYear())
    const [draftMonth, setDraftMonth] = useState(() => `${new Date().getMonth() + 1}`.padStart(2, '0'))
    const [draftYear, setDraftYear] = useState(() => String(new Date().getFullYear()))
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false)
    const monthPickerRef = useRef(null)

    const getData = async () => {
        setLoading(true)
        setError('')
        try {
            const [outcomesResponse, incomesResponse] = await Promise.all([
                axios.get('http://127.0.0.1:7200/api/outcomes'),
                axios.get('http://127.0.0.1:7200/api/incomes')
            ])
            setOutcomes(outcomesResponse.data)
            setIncomes(incomesResponse.data)
        } catch (requestError) {
            console.error('Failed to load monthly balance:', requestError)
            setError('לא הצלחנו לטעון את נתוני המאזן. כדאי לבדוק שהשרת פעיל ולנסות שוב.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if (!isMonthPickerOpen) return undefined

        const closeOnOutsideClick = (event) => {
            if (!monthPickerRef.current?.contains(event.target)) setIsMonthPickerOpen(false)
        }
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setIsMonthPickerOpen(false)
        }

        document.addEventListener('mousedown', closeOnOutsideClick)
        document.addEventListener('keydown', closeOnEscape)
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick)
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [isMonthPickerOpen])

    const currentMonthValue = formatMonthValue(new Date())
    const currentYear = new Date().getFullYear()
    const [selectedMonthYear, selectedMonthNumber] = selectedMonth.split('-').map(Number)
    const selectedYear = periodMode === 'annual' ? selectedAnnualYear : selectedMonthYear
    const draftMonthValue = `${draftYear}-${draftMonth}`
    const draftYearNumber = Number(draftYear)
    const isDraftYearValid = Number.isInteger(draftYearNumber)
        && draftYearNumber >= 1
        && draftYearNumber <= currentYear
    const isDraftPeriodValid = isDraftYearValid && (
        periodMode === 'annual' || (
            Number(draftMonth) >= 1
            && Number(draftMonth) <= 12
            && draftMonthValue <= currentMonthValue
        )
    )
    const selectedMonthDate = new Date(selectedYear, selectedMonthNumber - 1, 1)
    const selectedPeriodLabel = periodMode === 'annual' ? String(selectedYear) : new Intl.DateTimeFormat('he-IL', {
        month: 'long',
        year: 'numeric'
    }).format(selectedMonthDate)
    const isInSelectedPeriod = (value) => {
        const date = new Date(value)
        return !Number.isNaN(date.getTime())
            && date.getFullYear() === selectedYear
            && (periodMode === 'annual' || date.getMonth() === selectedMonthNumber - 1)
    }
    const totalSelectedPeriodExpenses = outcomes.reduce((total, outcome) => {
        const outcomeDate = new Date(outcome.date)
        return isInSelectedPeriod(outcomeDate) ? total + Number(outcome.sum || 0) : total
    }, 0)
    const totalSelectedPeriodIncome = incomes.reduce((total, income) => {
        const incomeDate = new Date(income.date)
        return isInSelectedPeriod(incomeDate) ? total + Number(income.sum || 0) : total
    }, 0)
    const totalBalance = totalSelectedPeriodIncome - totalSelectedPeriodExpenses
    const largestTotal = Math.max(totalSelectedPeriodIncome, totalSelectedPeriodExpenses)
    const incomeBarWidth = largestTotal ? (totalSelectedPeriodIncome / largestTotal) * 100 : 0
    const expensesBarWidth = largestTotal ? (totalSelectedPeriodExpenses / largestTotal) * 100 : 0
    const balanceStatus = totalBalance > 0 ? 'is-positive' : totalBalance < 0 ? 'is-negative' : 'is-even'
    const formattedBalance = Math.abs(totalBalance).toLocaleString('he-IL')

    return (
        <section className="monthly-balance-page page-container" dir="rtl">
            <header className="monthly-balance-heading page-header">
                <div>
                    <p className="eyebrow">ניהול כספים</p>
                    <h1>{periodMode === 'annual' ? 'מאזן שנתי' : 'מאזן חודשי'}</h1>
                    <p className="monthly-balance-subtitle">תמונת מצב של ההכנסות וההוצאות</p>
                </div>
                <div className="monthly-balance-header-actions">
                    <div className="monthly-balance-mode" role="group" aria-label="תקופת המאזן">
                        <button
                            type="button"
                            aria-pressed={periodMode === 'monthly'}
                            onClick={() => {
                                setPeriodMode('monthly')
                                setIsMonthPickerOpen(false)
                            }}
                        >
                            חודשי
                        </button>
                        <button
                            type="button"
                            aria-pressed={periodMode === 'annual'}
                            onClick={() => {
                                setPeriodMode('annual')
                                setIsMonthPickerOpen(false)
                            }}
                        >
                            שנתי
                        </button>
                    </div>
                    <div className="monthly-balance-picker-wrap" ref={monthPickerRef}>
                        <button
                            className="monthly-balance-period"
                            type="button"
                            aria-expanded={isMonthPickerOpen}
                            aria-haspopup="dialog"
                            onClick={() => {
                                setDraftYear(String(periodMode === 'annual' ? selectedAnnualYear : selectedMonthYear))
                                setDraftMonth(`${selectedMonthNumber}`.padStart(2, '0'))
                                setIsMonthPickerOpen((open) => !open)
                            }}
                        >
                            <i className="pi pi-calendar" aria-hidden="true" />
                            {selectedPeriodLabel}
                        </button>
                        {isMonthPickerOpen && <div className="monthly-balance-picker" role="dialog" aria-label={periodMode === 'annual' ? 'בחירת שנה למאזן' : 'בחירת חודש למאזן'}>
                            <form onSubmit={(event) => {
                                event.preventDefault()
                                if (!isDraftPeriodValid) return
                                if (periodMode === 'annual') {
                                    setSelectedAnnualYear(draftYearNumber)
                                } else {
                                    setSelectedMonth(draftMonthValue)
                                }
                                setIsMonthPickerOpen(false)
                            }}>
                                {periodMode === 'monthly' && <>
                                    <label htmlFor="monthly-balance-month">חודש</label>
                                    <select
                                        id="monthly-balance-month"
                                        value={draftMonth}
                                        onChange={(event) => setDraftMonth(event.target.value)}
                                    >
                                        {Array.from({ length: 12 }, (_, index) => {
                                            const monthValue = `${index + 1}`.padStart(2, '0')
                                            const monthLabel = new Intl.DateTimeFormat('he-IL', { month: 'long' }).format(new Date(2024, index, 1))
                                            return <option key={monthValue} value={monthValue}>{monthLabel}</option>
                                        })}
                                    </select>
                                </>}
                                <label htmlFor="monthly-balance-year">שנה</label>
                                <input
                                    id="monthly-balance-year"
                                    type="number"
                                    min="1"
                                    max={currentYear}
                                    step="1"
                                    value={draftYear}
                                    onChange={(event) => setDraftYear(event.target.value)}
                                    required
                                />
                                <button type="submit" disabled={!isDraftPeriodValid}>
                                    {periodMode === 'annual' ? 'הצג שנה' : 'הצג חודש'}
                                </button>
                            </form>
                        </div>}
                    </div>
                    <button className="monthly-balance-refresh" type="button" onClick={getData} disabled={loading}>
                        <i className={`pi ${loading ? 'pi-spin pi-spinner' : 'pi-refresh'}`} aria-hidden="true" />
                        רענון
                    </button>
                </div>
            </header>

            {error && (
                <div className="monthly-balance-feedback monthly-balance-error" role="alert">
                    <i className="pi pi-exclamation-circle" aria-hidden="true" />
                    <span>{error}</span>
                    <button type="button" onClick={getData}>נסו שוב</button>
                </div>
            )}
            {loading && (
                <div className="monthly-balance-feedback" role="status">
                    <i className="pi pi-spin pi-spinner" aria-hidden="true" />
                    טוענים את המאזן...
                </div>
            )}
            {!loading && !error && (
                <>
                    <section className={`balance-result ${balanceStatus}`} aria-label="תוצאה חודשית">
                        <div className="balance-result-copy">
                            <p>התוצאה של {periodMode === 'annual' ? 'שנת' : 'חודש'} {selectedPeriodLabel}</p>
                            <h2>{totalBalance > 0 ? 'יתרה חיובית' : totalBalance < 0 ? 'גירעון' : 'איזון מלא'}</h2>
                        </div>
                        <strong className="balance-result-amount" dir="ltr">
                            {totalBalance < 0 ? '−' : ''}{formattedBalance} <small>₪</small>
                        </strong>
                    </section>

                    <section className="balance-breakdown" aria-labelledby="balance-breakdown-title">
                        <div className="balance-breakdown-heading">
                            <div>
                                <h2 id="balance-breakdown-title">{periodMode === 'annual' ? 'פירוט שנתי' : 'פירוט חודשי'}</h2>
                                <p>השוואת הכנסות והוצאות בתקופה</p>
                            </div>
                            <span>{selectedPeriodLabel}</span>
                        </div>
                        <div className="balance-metrics">
                            <article className="balance-metric income-metric">
                                <div className="balance-metric-heading">
                                    <span className="balance-metric-icon"><i className="pi pi-arrow-down-left" aria-hidden="true" /></span>
                                    <div>
                                        <p>הכנסות</p>
                                        <strong dir="ltr">{totalSelectedPeriodIncome.toLocaleString('he-IL')} ₪</strong>
                                    </div>
                                </div>
                                <div className="balance-meter" role="img" aria-label={`הכנסות: ${totalSelectedPeriodIncome.toLocaleString('he-IL')} שקלים`}>
                                    <span style={{ width: `${incomeBarWidth}%` }} />
                                </div>
                            </article>
                            <article className="balance-metric expenses-metric">
                                <div className="balance-metric-heading">
                                    <span className="balance-metric-icon"><i className="pi pi-arrow-up-right" aria-hidden="true" /></span>
                                    <div>
                                        <p>הוצאות</p>
                                        <strong dir="ltr">{totalSelectedPeriodExpenses.toLocaleString('he-IL')} ₪</strong>
                                    </div>
                                </div>
                                <div className="balance-meter" role="img" aria-label={`הוצאות: ${totalSelectedPeriodExpenses.toLocaleString('he-IL')} שקלים`}>
                                    <span style={{ width: `${expensesBarWidth}%` }} />
                                </div>
                            </article>
                        </div>
                    </section>
                </>
            )}
        </section>
    )
}

export default MonthlyBalance