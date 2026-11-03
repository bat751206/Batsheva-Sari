import { Navigate, Outlet } from "react-router-dom"

const RequireAuth = () => {
    const token = localStorage.getItem("accessToken")

    return token ? <Outlet /> : <Navigate to="/" replace />
}
export default RequireAuth