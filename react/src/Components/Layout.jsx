import Header from './Header'
import { Outlet, useLocation } from 'react-router-dom'

const Layout = () => {
    const location = useLocation()
    const isRentCalendar = location.pathname === '/rents'

    return (
        <div className="app-shell">
            <Header />
            <main className={`page-content${isRentCalendar ? ' page-content-rent-calendar' : ''}`}>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout