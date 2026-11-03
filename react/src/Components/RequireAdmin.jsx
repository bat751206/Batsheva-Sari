import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from './AuthContext'

const RequireAdmin = () => {
    const { isAdmin } = useContext(AuthContext)

    return isAdmin ? <Outlet /> : <Navigate to="/home" replace />
}

export default RequireAdmin