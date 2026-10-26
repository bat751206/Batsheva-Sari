import React from 'react'
import { useState } from 'react'
import axios from 'axios'

const Shopping = ({ setAddShopping, onSaved }) => {
    const [type, setType] = useState('מזומן')
    const [error, setError] = useState('')
    const [expenseSaved, setExpenseSaved] = useState(false)

    const addOutcome = async (e) => {
        e.preventDefault()
        const data = new FormData(e.target)
        const info = Object.fromEntries(data.entries())

        const expense = {
            date: info.date,
            sum: Number(info.sum),
            description: info.description,
            paymentType: info.paymentType
        }
        const stockUpdate = {
            product: info.description,
            addAmount: Number(info.amount)
        }

        try {
            await axios.post('http://127.0.0.1:7200/api/outcomes', expense)
            setExpenseSaved(true)
        } catch (requestError) {
            console.error('Failed to record shopping expense:', requestError)
            setError('שמירת ההוצאה נכשלה. בדקו את הפרטים ונסו שוב.')
            return
        }

        try {
            await axios.put('http://127.0.0.1:7200/api/amount/add', stockUpdate)
            await onSaved?.()
            setAddShopping(false)
        } catch (requestError) {
            console.error('Failed to record shopping and update stock:', requestError)
            await onSaved?.()
            setError('ההוצאה נשמרה, אך עדכון המלאי נכשל. סגרו את הטופס ונסו לעדכן את המלאי בנפרד.')
        }
    }

    return (
        <div className="expense-form-content">
            <div className="expense-form-heading">
                <div>
                    <span className="expense-form-icon"><i className="pi pi-shopping-bag" aria-hidden="true" /></span>
                    <h2>קנייה ועדכון מלאי</h2>
                </div>
                <button className="expense-form-close" type="button" onClick={() => setAddShopping(false)} aria-label="סגירת הטופס">
                    <i className="pi pi-times" aria-hidden="true" />
                </button>
            </div>
            <form className="expense-form" onSubmit={addOutcome}>
                <label>תאריך<input name="date" type="date" required /></label>
                <label>סכום כולל (₪)<input name="sum" type="number" min="0.01" step="0.01" placeholder="לדוגמה: 120" required /></label>
                <label>שם המוצר<input name="description" type="text" placeholder="שם המוצר במלאי" required /></label>
                <label>כמות שנרכשה<input name="amount" type="number" min="1" step="1" placeholder="לדוגמה: 3" required /></label>
                <label>אמצעי תשלום
                    <select name="paymentType" value={type} onChange={(event) => setType(event.target.value)} required>
                        <option value="מזומן">מזומן</option>
                        <option value="העברה">העברה</option>
                        <option value="צ'ק">צ'ק</option>
                        <option value="אשראי">אשראי</option>
                        <option value="אשראי דיירקט">אשראי דיירקט</option>
                    </select>
                </label>
                {error && <p className="expense-form-error" role="alert">{error}</p>}
                <div className="expense-form-actions">
                    <button className="expense-form-submit" type="submit" disabled={expenseSaved}>
                        {expenseSaved ? 'ההוצאה כבר נשמרה' : 'שמירת קנייה'}
                    </button>
                    <button className="expense-form-cancel" type="button" onClick={() => setAddShopping(false)}>ביטול</button>
                </div>
            </form>
        </div>
    )
}

export default Shopping

