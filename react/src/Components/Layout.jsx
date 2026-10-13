import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <div className="app-shell">
            <Header />
            <main className="page-content">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout