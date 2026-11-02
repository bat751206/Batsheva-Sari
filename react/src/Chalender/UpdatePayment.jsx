import React, { useState } from 'react'
import axios from 'axios'

const UpdatePayment = ({ rent, onClose, onPaymentUpdated }) => {
    const [paymentType, setPaymentType] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    const confirmPayment = async (event) => {
        event.preventDefault()
        if (!paymentType) return

        setIsSaving(true)
        setError('')
        try {
            await axios.put('http://127.0.0.1:7200/api/rents/payment', { id: rent._id, paymentType })

            onPaymentUpdated?.()
        } catch (error) {
            console.error('Error updating payment type:', error)
            setError(error.response?.data?.message || 'עדכון התשלום נכשל. נסו שוב.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form className="update-payment-form" onSubmit={confirmPayment}>
            <div className="update-payment-summary">
                <span>סכום לתשלום</span>
                <strong>{(Number(rent.sumPayment || 0)-Number(rent.advance || 0)).toLocaleString('he-IL')} ₪</strong>
            </div>
            <label className="update-payment-field" htmlFor="paymentType">
                <span>אמצעי תשלום</span>
                <select
                    id="paymentType"
                    name="paymentType"
                    value={paymentType}
                    onChange={(event) => setPaymentType(event.target.value)}
                    required
                >
                    <option value="" disabled>בחירת אמצעי תשלום</option>
                    <option value="מזומן">מזומן</option>
                    <option value="העברה">העברה</option>
                    <option value="צ'ק">צ׳ק</option>
                </select>
            </label>
            {error && <p className="update-payment-error" role="alert">{error}</p>}
            <div className="update-payment-actions">
                <button type="button" className="update-payment-cancel" onClick={onClose} disabled={isSaving}>
                    ביטול
                </button>
                <button type="submit" className="update-payment-confirm" disabled={!paymentType || isSaving}>
                    {isSaving ? 'מעדכן...' : 'אישור תשלום'}
                </button>
            </div>
        </form>
    )
}

export default UpdatePayment