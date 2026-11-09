import React from 'react'
import { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import AuthContext from './AuthContext'

const Header = () => {
    const { isAdmin, setIsAdmin } = useContext(AuthContext)
    const navigate = useNavigate()
    const links = [
        { label: 'כספים', to: '/account' },
        { label: 'השכרות', to: '/rents' },
        { label: 'מלאי', to: '/amount' },
        { label: 'משימות', to: '/todos' },
        { label: 'היסטוריה', to: '/history' },
    ]
    // מוסיף את קישור ניהול החשבונות רק לתפריט של מנהל.
    if (isAdmin) links.push({ label: 'הוספת מנהל', to: '/admin/add' })

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        setIsAdmin(false)
        navigate('/', { replace: true })
    }

    return (
        <header className="topbar-wrap">
            <div className="main-menubar">
                <NavLink to="/home" className="brand-box" aria-label="לדף הבית" >
                    <span className="brand-icon pi pi-home" />
                    <span>לדף הבית</span>
                </NavLink>

                <nav className="header-nav" aria-label="Main navigation">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `header-link ${isActive ? 'active' : ''}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    <button className="header-link header-logout" type="button" onClick={handleLogout}>
                        <i className="pi pi-sign-out" aria-hidden="true" />
                        יציאה
                    </button>
                </nav>
            </div>
        </header>
    )
}

export default Header