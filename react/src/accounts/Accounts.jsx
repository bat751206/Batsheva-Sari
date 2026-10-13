import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'

const Accounts = () => {
    const navigate = useNavigate()

   

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <p className="eyebrow">מערכת ניהול</p>
                    <h1>כספים</h1>
                </div>
                <Button label="הוספת הכנסה" icon="pi pi-plus" severity="success" onClick={() => navigate('/account/incomes')} />
            </div>

            

            <Card className="quick-actions-card" title="פעולות מהירות">
                <div className="quick-actions">
                    <Button label="הכנסות" icon="pi pi-arrow-up" severity="success" onClick={() => navigate('/account/incomes')} />
                    <Button label="הוצאות" icon="pi pi-arrow-down" severity="danger" onClick={() => navigate('/account/outcomes')} />
                    <Button label="מאזן חודשי" icon="pi pi-chart-bar" severity="info" />
                </div>
            </Card>
        </div>
    )
}

export default Accounts