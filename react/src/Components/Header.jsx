import React from 'react'
import { NavLink } from 'react-router-dom'

const Header = () => {
    const links = [
        { label: 'כספים', to: '/account' },
        { label: 'השכרות', to: '/rents' },
        { label: 'מלאי', to: '/amount' },
        { label: 'משימות', to: '/todos' },
        { label: 'היסטוריה', to: '/history' },
    ]

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
                </nav>
            </div>
        </header>
    )
}

export default Header