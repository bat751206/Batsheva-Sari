import React from 'react'
import { NavLink } from 'react-router-dom'

const Header = () => {
    const links = [
        { label: 'כספים', to: '/account' },
        { label: 'השכרות', to: '/rents' },
        { label: 'מלאי', to: '/stock' },
        { label: 'משימות', to: '/tasks' },
    ]

    return (
        <header className="topbar-wrap">
            <div className="main-menubar">
                <div className="brand-box">
                    <span className="brand-icon pi pi-home" />
                    <span>בַּת-שֶׁבַע ושרי</span>
                </div>

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