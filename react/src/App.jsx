import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState } from 'react' 
import { jwtDecode } from 'jwt-decode'
import AuthContext from './Components/AuthContext'
import Accounts from './accounts/Accounts'
import Incomes from './accounts/Incomes'
import Outcomes from './accounts/Outcomes'
import MonthlyBalance from './accounts/MonthlyBalance'
import Layout from './Components/Layout'
import RentCalendar from './Chalender/RentCalendar'
import ShowStock from './stock/ShowStock'
import Todos from './Todos/Todos'
import HomePage from './Components/HomePage'
import ShowHistory from './History/ShowHistory'
import ShowRentalHistory from './History/ShowRentalHistory'
import ShowRenterHistory from './History/ShowRenterHistory'
import Login from './Components/Login'
import RequireAuth from './Components/RequireAuth'
import RequireAdmin from './Components/RequireAdmin'
import Register from './Components/Register'  
import AddAdmin from './AdminSetting/AddAdmin'
import './App.css'


const getIsAdminFromToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) return false

  try {
    return jwtDecode(token).roles === 'Admin'
  } catch {
    return false
  }
}

function App() {
  const [isAdmin, setIsAdmin] = useState(getIsAdminFromToken)

  return (
    <>
      <AuthContext.Provider value={{ isAdmin, setIsAdmin }}>
        <Router>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route element={<RequireAuth />}>

              <Route element={<Layout />}>
                <Route path='/home' element={<HomePage />} />
                <Route path='/account' element={<Accounts />} />
                <Route path='/account/outcomes' element={<Outcomes />} />
                <Route element={<RequireAdmin />}>
                  <Route path='/admin/add' element={<AddAdmin />} />
                  <Route path='/account/incomes' element={<Incomes />} />
                  <Route path='/account/monthlybalance' element={<MonthlyBalance />} />
                </Route>
                <Route path='/rents' element={<RentCalendar />} />
                <Route path='/amount' element={<ShowStock />} />
                <Route path='/todos' element={<Todos />} />
                <Route path='/history' element={<ShowHistory />} />
                <Route path='/history/rental' element={<ShowRentalHistory />} />
                <Route path='/history/renters' element={<ShowRenterHistory />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthContext.Provider>
    </>
  )
}

export default App
