import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import AuthContext from '../Components/AuthContext'
import './Accounts.css'

const Accounts = () => {
    const { isAdmin } = useContext(AuthContext)
    const navigate = useNavigate()

    return (
        <main className="accounts-page page-container" dir="rtl">
            <header className="accounts-heading page-header">
                <div>
                    <p className="eyebrow">מערכת ניהול</p>
                    <h1>ניהול כספים</h1>
                    <p className="accounts-subtitle">כל הכלים לניהול ההכנסות, ההוצאות והיתרה</p>
                </div>
            </header>

            <section className="accounts-workspace" aria-label="כלים פיננסיים">
                <div className="accounts-actions">
                    <h2>פעולות פיננסיות</h2>
                    <div className="quick-actions">
                        {isAdmin && (
                            <Button className="accounts-action-button accounts-income-action" label="הכנסות" icon="pi pi-arrow-up" onClick={() => navigate('/account/incomes')} />
                        )}
                        <Button className="accounts-action-button accounts-expense-action" label="הוצאות" icon="pi pi-arrow-down" onClick={() => navigate('/account/outcomes')} />
                        {isAdmin && (
                            <Button className="accounts-action-button accounts-balance-action" label="מאזן חודשי" icon="pi pi-chart-bar" onClick={() => navigate('/account/monthlybalance')} />
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Accounts