import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './MonthlyBalance.css'

const MonthlyBalance = () => {
    const [incomes, setIncomes] = useState([])
    const [outcomes, setOutcomes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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

    const currentDate = new Date()
    const currentMonthLabel = new Intl.DateTimeFormat('he-IL', {
        month: 'long',
        year: 'numeric'
    }).format(currentDate)
    const totalCurrentMonthExpenses = outcomes.reduce((total, outcome) => {
        const outcomeDate = new Date(outcome.date)
        if (Number.isNaN(outcomeDate.getTime())) return total

        const isCurrentMonth = outcomeDate.getFullYear() === currentDate.getFullYear()
            && outcomeDate.getMonth() === currentDate.getMonth()
        return isCurrentMonth ? total + Number(outcome.sum || 0) : total
    }, 0)
    const totalCurrentMonthIncome = incomes.reduce((total, income) => {
        const incomeDate = new Date(income.date)
        if (Number.isNaN(incomeDate.getTime())) return total

        const isCurrentMonth = incomeDate.getFullYear() === currentDate.getFullYear()
            && incomeDate.getMonth() === currentDate.getMonth()
        return isCurrentMonth ? total + Number(income.sum || 0) : total
    }, 0)
    const totalBalance = totalCurrentMonthIncome - totalCurrentMonthExpenses
    const largestTotal = Math.max(totalCurrentMonthIncome, totalCurrentMonthExpenses)
    const incomeBarWidth = largestTotal ? (totalCurrentMonthIncome / largestTotal) * 100 : 0
    const expensesBarWidth = largestTotal ? (totalCurrentMonthExpenses / largestTotal) * 100 : 0
    const balanceStatus = totalBalance > 0 ? 'is-positive' : totalBalance < 0 ? 'is-negative' : 'is-even'
    const formattedBalance = Math.abs(totalBalance).toLocaleString('he-IL')

    return (
        <section className="monthly-balance-page page-container" dir="rtl">
            <header className="monthly-balance-heading page-header">
                <div>
                    <p className="eyebrow">ניהול כספים</p>
                    <h1>מאזן חודשי</h1>
                    <p className="monthly-balance-subtitle">תמונת מצב של ההכנסות וההוצאות</p>
                </div>
                <div className="monthly-balance-header-actions">
                    <span className="monthly-balance-period">
                        <i className="pi pi-calendar" aria-hidden="true" />
                        {currentMonthLabel}
                    </span>
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
                    טוענים את המאזן החודשי...
                </div>
            )}
            {!loading && !error && (
                <>
                    <section className={`balance-result ${balanceStatus}`} aria-label="תוצאה חודשית">
                        <div className="balance-result-copy">
                            <p>התוצאה של {currentMonthLabel}</p>
                            <h2>{totalBalance > 0 ? 'יתרה חיובית' : totalBalance < 0 ? 'גירעון' : 'איזון מלא'}</h2>
                        </div>
                        <strong className="balance-result-amount" dir="ltr">
                            {totalBalance < 0 ? '−' : ''}{formattedBalance} <small>₪</small>
                        </strong>
                    </section>

                    <section className="balance-breakdown" aria-labelledby="balance-breakdown-title">
                        <div className="balance-breakdown-heading">
                            <div>
                                <h2 id="balance-breakdown-title">פירוט חודשי</h2>
                                <p>השוואת הכנסות והוצאות בתקופה</p>
                            </div>
                            <span>{currentMonthLabel}</span>
                        </div>
                        <div className="balance-metrics">
                            <article className="balance-metric income-metric">
                                <div className="balance-metric-heading">
                                    <span className="balance-metric-icon"><i className="pi pi-arrow-down-left" aria-hidden="true" /></span>
                                    <div>
                                        <p>הכנסות</p>
                                        <strong dir="ltr">{totalCurrentMonthIncome.toLocaleString('he-IL')} ₪</strong>
                                    </div>
                                </div>
                                <div className="balance-meter" role="img" aria-label={`הכנסות: ${totalCurrentMonthIncome.toLocaleString('he-IL')} שקלים`}>
                                    <span style={{ width: `${incomeBarWidth}%` }} />
                                </div>
                            </article>
                            <article className="balance-metric expenses-metric">
                                <div className="balance-metric-heading">
                                    <span className="balance-metric-icon"><i className="pi pi-arrow-up-right" aria-hidden="true" /></span>
                                    <div>
                                        <p>הוצאות</p>
                                        <strong dir="ltr">{totalCurrentMonthExpenses.toLocaleString('he-IL')} ₪</strong>
                                    </div>
                                </div>
                                <div className="balance-meter" role="img" aria-label={`הוצאות: ${totalCurrentMonthExpenses.toLocaleString('he-IL')} שקלים`}>
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