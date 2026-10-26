import React from 'react'
import { useState } from 'react'
import axios from 'axios'

const AddOutcome = ({ setAddNew, onSaved }) => {
    const [type, setType] = useState('מזומן')
    const [error, setError] = useState('')

    const addOutcome = async (e) => {
        e.preventDefault()
        const data = new FormData(e.target)
        const info = Object.fromEntries(data.entries())

        const obj = {
            date: info.date,
            sum: Number(info.sum),
            description: info.description,
            paymentType: info.paymentType
        }
        try {
            await axios.post('http://127.0.0.1:7200/api/outcomes', obj)
            await onSaved?.()
            setAddNew(false)
        } catch (requestError) {
            console.error('Failed to add expense:', requestError)
            setError('שמירת ההוצאה נכשלה. בדקו את הפרטים ונסו שוב.')
        }
    }
    return (
        <div className="expense-form-content">
            <div className="expense-form-heading">
                <div>
                    <span className="expense-form-icon"><i className="pi pi-file-edit" aria-hidden="true" /></span>
                    <h2>הוצאה אחרת</h2>
                </div>
                <button className="expense-form-close" type="button" onClick={() => setAddNew(false)} aria-label="סגירת הטופס">
                    <i className="pi pi-times" aria-hidden="true" />
                </button>
            </div>
            <form className="expense-form" onSubmit={addOutcome}>
                <label>תאריך<input name="date" type="date" required /></label>
                <label>סכום (₪)<input name="sum" type="number" min="0.01" step="0.01" placeholder="לדוגמה: 120" required /></label>
                <label className="expense-form-wide">תיאור<input name="description" type="text" placeholder="על מה ההוצאה?" required /></label>
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
                    <button className="expense-form-submit" type="submit">שמירת הוצאה</button>
                    <button className="expense-form-cancel" type="button" onClick={() => setAddNew(false)}>ביטול</button>
                </div>
            </form>
        </div>
    )
}

export default AddOutcome