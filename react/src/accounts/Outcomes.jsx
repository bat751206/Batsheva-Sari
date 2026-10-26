import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import SingleOutcome from './SingleOutcome'
import AddOutcome from './AddOutcome'
import Shopping from './Shopping'
import './Outcomes.css'

const getOutcomeMonth = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return { key: 'invalid-date', label: 'תאריך לא תקין' }
    }

    return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(date)
    }
}

const Outcomes = () => {
    const [addNew, setAddNew] = useState(false)
    const [addShopping, setAddShopping] = useState(false)
    const [info, setInfo] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')

    const getData = async () => {
        setLoading(true)
        setError('')
        try {
            const { data } = await axios.get('http://127.0.0.1:7200/api/outcomes')
            setInfo(data)
        } catch (requestError) {
            console.error('Failed to load expenses:', requestError)
            setError('לא הצלחנו לטעון את ההוצאות. כדאי לבדוק שהשרת פעיל ולנסות שוב.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const filteredOutcomes = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('he')
        return info.filter((outcome) =>
            [outcome.description, outcome.paymentType, outcome.date]
                .some((value) => String(value || '').toLocaleLowerCase('he').includes(query))
        ).sort((leftOutcome, rightOutcome) => {
            const leftDate = new Date(leftOutcome.date).getTime()
            const rightDate = new Date(rightOutcome.date).getTime()
            const leftIsValid = Number.isFinite(leftDate)
            const rightIsValid = Number.isFinite(rightDate)

            if (!leftIsValid) return rightIsValid ? 1 : 0
            if (!rightIsValid) return -1
            return rightDate - leftDate
        })
    }, [info, search])

    const currentDate = new Date()
    const totalCurrentMonthExpenses = info.reduce((total, outcome) => {
        const outcomeDate = new Date(outcome.date)
        if (Number.isNaN(outcomeDate.getTime())) return total

        const isCurrentMonth = outcomeDate.getFullYear() === currentDate.getFullYear()
            && outcomeDate.getMonth() === currentDate.getMonth()
        return isCurrentMonth ? total + Number(outcome.sum || 0) : total
    }, 0)

    return (
        <section className="expenses-page page-container">
            <header className="expenses-heading page-header">
                <div>
                    <p className="eyebrow">ניהול כספים</p>
                    <h1>הוצאות</h1>
                    <p className="expenses-subtitle">מעקב מסודר אחר כל ההוצאות</p>
                </div>
                <button className="expenses-refresh-button" type="button" onClick={getData} disabled={loading}>
                    <i className={`pi ${loading ? 'pi-spin pi-spinner' : 'pi-refresh'}`} aria-hidden="true" />
                    רענון
                </button>
            </header>

            <div className="expenses-summary-grid">
                <article className="expenses-summary-card">
                    <span className="expenses-summary-icon total-expenses-icon"><i className="pi pi-wallet" aria-hidden="true" /></span>
                    <div>
                        <p>סך הוצאות לחודש הנוכחי</p>
                        <strong>{totalCurrentMonthExpenses.toLocaleString('he-IL')} <small>₪</small></strong>
                    </div>
                </article>
                <article className="expenses-summary-card">
                    <span className="expenses-summary-icon count-expenses-icon"><i className="pi pi-receipt" aria-hidden="true" /></span>
                    <div>
                        <p>מספר הוצאות</p>
                        <strong>{info.length}</strong>
                    </div>
                </article>
            </div>

            <section className="expenses-actions-panel">
                <div>
                    <h2>הוספת הוצאה</h2>
                    <p>אפשר לדווח על הוצאה רגילה או על קנייה שמעדכנת גם את המלאי.</p>
                </div>
                <div className="expenses-action-buttons">
                    <button className="expense-action-button shopping-action" type="button" onClick={() => {
                        setAddShopping((visible) => !visible)
                        setAddNew(false)
                    }}>
                        <i className="pi pi-shopping-bag" aria-hidden="true" />
                        קנייה ועדכון מלאי
                    </button>
                    <button className="expense-action-button other-action" type="button" onClick={() => {
                        setAddNew((visible) => !visible)
                        setAddShopping(false)
                    }}>
                        <i className="pi pi-plus" aria-hidden="true" />
                        הוצאה אחרת
                    </button>
                </div>
            </section>

            {(addNew || addShopping) && (
                <section className="expense-form-panel">
                    {addNew && <AddOutcome setAddNew={setAddNew} onSaved={getData} />}
                    {addShopping && <Shopping setAddShopping={setAddShopping} onSaved={getData} />}
                </section>
            )}

            <section className="expenses-list-panel">
                <div className="expenses-list-heading">
                    <div>
                        <h2>רשימת הוצאות</h2>
                        <p>{filteredOutcomes.length} מתוך {info.length} הוצאות</p>
                    </div>
                    <label className="expenses-search">
                        <i className="pi pi-search" aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="חיפוש לפי תיאור או אמצעי תשלום"
                            aria-label="חיפוש הוצאות"
                        />
                    </label>
                </div>

                {error && (
                    <div className="expenses-feedback expenses-error" role="alert">
                        <i className="pi pi-exclamation-circle" aria-hidden="true" />
                        <span>{error}</span>
                        <button type="button" onClick={getData}>נסו שוב</button>
                    </div>
                )}
                {loading && <div className="expenses-feedback"><i className="pi pi-spin pi-spinner" aria-hidden="true" /> טוענים את ההוצאות...</div>}
                {!loading && !error && filteredOutcomes.length === 0 && (
                    <div className="expenses-empty-state">
                        <i className="pi pi-file" aria-hidden="true" />
                        <strong>{search ? 'לא נמצאו הוצאות מתאימות' : 'עדיין אין הוצאות להצגה'}</strong>
                        <span>{search ? 'אפשר לנסות חיפוש אחר.' : 'הוצאות חדשות יופיעו כאן לאחר הדיווח.'}</span>
                    </div>
                )}
                {!loading && !error && filteredOutcomes.length > 0 && (
                    <div className="expenses-list">
                        {filteredOutcomes.map((outcome, index) => {
                            const outcomeMonth = getOutcomeMonth(outcome.date)
                            const previousMonth = index > 0
                                ? getOutcomeMonth(filteredOutcomes[index - 1].date)
                                : null

                            return (
                                <React.Fragment key={outcome._id}>
                                    {outcomeMonth.key !== previousMonth?.key && (
                                        <h3 className="expense-month-heading">{outcomeMonth.label}</h3>
                                    )}
                                    <SingleOutcome outcome={outcome} />
                                </React.Fragment>
                            )
                        })}
                    </div>
                )}
            </section>
        </section>
    )
}

export default Outcomes
