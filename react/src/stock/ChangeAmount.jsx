import React, { useState } from 'react'
import axios from 'axios'

const ChangeAmount = ({ product, onClose, onSave }) => {
    const [amountUsed, setAmountUsed] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const availableQuantity = Number(product.proAmount || 0)
    const parsedAmount = Number(amountUsed)
    const canSave = Number.isInteger(parsedAmount) && parsedAmount > 0 && parsedAmount <= availableQuantity

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!canSave || saving) return

        setSaving(true)
        setError('')
        try {
            const { data } = await axios.put('http://127.0.0.1:7200/api/amount/use', {
                product: product.product,
                lessAmount: parsedAmount
            })
            if (!data || typeof data !== 'object' || !data._id) {
                throw new Error('The stock update was rejected')
            }
            onSave(data)
        } catch (requestError) {
            console.error('Failed to update stock quantity:', requestError)
            setError('לא הצלחנו לשמור את השינוי. בדקו את החיבור ונסו שוב.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="stock-modal-backdrop">
            <section className="stock-modal-panel" role="dialog" aria-modal="true" aria-labelledby="change-amount-title" dir="rtl">
                <header className="stock-modal-heading">
                    <div>
                        <p>עדכון מלאי</p>
                        <h2 id="change-amount-title">{product.product}</h2>
                    </div>
                    <button className="stock-modal-close" type="button" onClick={onClose} aria-label="סגירה">
                        <i className="pi pi-times" aria-hidden="true" />
                    </button>
                </header>
                <p className="stock-modal-quantity">כמות זמינה: <strong>{availableQuantity}</strong></p>
                <form onSubmit={handleSubmit}>
                    <label className="stock-modal-field">
                        כמה השתמשת?
                        <input
                            type="number"
                            min="1"
                            max={availableQuantity}
                            step="1"
                            value={amountUsed}
                            onChange={(event) => setAmountUsed(event.target.value)}
                            disabled={saving || availableQuantity === 0}
                            required
                        />
                    </label>
                    {error && <p className="stock-modal-error" role="alert">{error}</p>}
                    <div className="stock-modal-actions">
                        <button className="stock-modal-save" type="submit" disabled={!canSave || saving}>
                            {saving ? 'שומרים...' : 'אישור '}
                        </button>
                        <button className="stock-modal-cancel" type="button" onClick={onClose} disabled={saving}>
                            ביטול
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}

export default ChangeAmount