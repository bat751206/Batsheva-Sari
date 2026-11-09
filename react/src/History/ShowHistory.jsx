import React from 'react'
import { Link } from 'react-router-dom'
import './ShowHistory.css'

const ShowHistory = () => {
    return (
        <main className="history-home" dir="rtl">
            <header className="history-home-header">
                <p className="history-home-eyebrow">ארכיון הבית</p>
                <h1>היסטוריה</h1>
                <p className="history-home-intro">כל המידע הקודם, מסודר ונגיש במקום אחד.</p>
            </header>

            <nav className="history-home-nav" aria-label="בחירת סוג היסטוריה">
                <Link className="history-home-link history-home-link-rentals" to="/history/rental">
                    <span className="history-home-icon" aria-hidden="true">
                        <i className="pi pi-calendar" />
                    </span>
                    <span className="history-home-link-copy">
                        <span className="history-home-link-kicker">01 / פעילות</span>
                        <strong>היסטוריית השכרות</strong>
                        <span>צפייה בהזמנות קודמות ובפרטי כל השכרה.</span>
                    </span>
                    <i className="pi pi-arrow-left history-home-arrow" aria-hidden="true" />
                </Link>

                <Link className="history-home-link history-home-link-renters" to="/history/renters">
                    <span className="history-home-icon" aria-hidden="true">
                        <i className="pi pi-users" />
                    </span>
                    <span className="history-home-link-copy">
                        <span className="history-home-link-kicker">02 / אנשי קשר</span>
                        <strong>פרטי שוכרים</strong>
                        <span>חיפוש שוכרים, פרטי קשר והיסטוריית ההשכרות שלהם.</span>
                    </span>
                    <i className="pi pi-arrow-left history-home-arrow" aria-hidden="true" />
                </Link>
            </nav>
        </main>
    )
}

export default ShowHistory