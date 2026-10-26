import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import SingleIncome from './SingleIncome'
import './Incomes.css'

const getIncomeMonth = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return { key: 'invalid-date', label: 'תאריך לא תקין' }
    }

    return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(date)
    }
}

const Incomes = () => {
    const [info, setInfo] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const getData = async () => {
        setLoading(true)
        setError('')
        try {
            const { data } = await axios.get('http://127.0.0.1:7200/api/incomes')
            setInfo(data)
        } catch (requestError) {
            console.error('Failed to load incomes:', requestError)
            setError('לא הצלחנו לטעון את ההכנסות. כדאי לבדוק שהשרת פעיל ולנסות שוב.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const filteredIncomes = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('he')
        return info.filter((income) =>
            [income.date, income.paymentType, income.renter]
                .some((value) => String(value || '').toLocaleLowerCase('he').includes(query))
        ).sort((leftIncome, rightIncome) => {
            const leftDate = new Date(leftIncome.date).getTime()
            const rightDate = new Date(rightIncome.date).getTime()
            const leftIsValid = Number.isFinite(leftDate)
            const rightIsValid = Number.isFinite(rightDate)

            if (!leftIsValid) return rightIsValid ? 1 : 0
            if (!rightIsValid) return -1
            return rightDate - leftDate
        })
    }, [info, search])

    const currentDate = new Date()
    const totalCurrentMonthIncome = info.reduce((total, income) => {
        const incomeDate = new Date(income.date)
        if (Number.isNaN(incomeDate.getTime())) return total

        const isCurrentMonth = incomeDate.getFullYear() === currentDate.getFullYear()
            && incomeDate.getMonth() === currentDate.getMonth()
        return isCurrentMonth ? total + Number(income.sum || 0) : total
    }, 0)

    return (
        <section className="incomes-page page-container">
            <header className="incomes-heading page-header">
                <div>
                    <p className="eyebrow">ניהול כספים</p>
                    <h1>הכנסות</h1>
                    <p className="incomes-subtitle">מעקב מסודר אחר התשלומים שהתקבלו</p>
                </div>
                <button className="incomes-refresh-button" type="button" onClick={getData} disabled={loading}>
                    <i className={`pi ${loading ? 'pi-spin pi-spinner' : 'pi-refresh'}`} aria-hidden="true" />
                    רענון
                </button>
            </header>

            <div className="incomes-summary-grid">
                <article className="income-summary-card">
                    <span className="income-summary-icon income-total-icon"><i className="pi pi-wallet" aria-hidden="true" /></span>
                    <div>
                        <p>סך הכנסות לחודש הנוכחי</p>
                        <strong>{totalCurrentMonthIncome.toLocaleString('he-IL')} <small>₪</small></strong>
                    </div>
                </article>
                <article className="income-summary-card">
                    <span className="income-summary-icon income-count-icon"><i className="pi pi-arrow-down-left" aria-hidden="true" /></span>
                    <div>
                        <p>מספר תשלומים</p>
                        <strong>{info.length}</strong>
                    </div>
                </article>
            </div>

            <section className="income-list-panel">
                <div className="income-list-heading">
                    <div>
                        <h2>רשימת הכנסות</h2>
                        <p>{filteredIncomes.length} מתוך {info.length} תשלומים</p>
                    </div>
                    <label className="income-search">
                        <i className="pi pi-search" aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="חיפוש לפי תאריך או אמצעי תשלום"
                            aria-label="חיפוש הכנסות"
                        />
                    </label>
                </div>

                {error && (
                    <div className="income-feedback income-error" role="alert">
                        <i className="pi pi-exclamation-circle" aria-hidden="true" />
                        <span>{error}</span>
                        <button type="button" onClick={getData}>נסו שוב</button>
                    </div>
                )}
                {loading && <div className="income-feedback"><i className="pi pi-spin pi-spinner" aria-hidden="true" /> טוענים את ההכנסות...</div>}
                {!loading && !error && filteredIncomes.length === 0 && (
                    <div className="income-empty-state">
                        <i className="pi pi-wallet" aria-hidden="true" />
                        <strong>{search ? 'לא נמצאו הכנסות מתאימות' : 'עדיין אין הכנסות להצגה'}</strong>
                        <span>{search ? 'אפשר לנסות חיפוש אחר.' : 'תשלומים חדשים יופיעו כאן לאחר קליטתם.'}</span>
                    </div>
                )}
                {!loading && !error && filteredIncomes.length > 0 && (
                    <div className="income-list">
                        {filteredIncomes.map((income, index) => {
                            const incomeMonth = getIncomeMonth(income.date)
                            const previousMonth = index > 0
                                ? getIncomeMonth(filteredIncomes[index - 1].date)
                                : null

                            return (
                                <React.Fragment key={income._id}>
                                    {incomeMonth.key !== previousMonth?.key && (
                                        <h3 className="income-month-heading">{incomeMonth.label}</h3>
                                    )}
                                    <SingleIncome income={income} />
                                </React.Fragment>
                            )
                        })}
                    </div>
                )}
            </section>
        </section>
    )
}

export default Incomes