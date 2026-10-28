import Accounts from './accounts/Accounts'
import Incomes from './accounts/Incomes'
import Outcomes from './accounts/Outcomes'
import MonthlyBalance from './accounts/MonthlyBalance'
import './App.css'
import Layout from './Components/Layout'
import RentCalendar from './Chalender/RentCalendar'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ShowStock from './stock/ShowStock'
import Todos from './Todos/Todos'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route path='/account' element={<Accounts />} />
            <Route path='/account/incomes' element={<Incomes />} />
            <Route path='/account/outcomes' element={<Outcomes />} />
            <Route path='/account/monthlybalance' element={<MonthlyBalance />} />
            <Route path='/rents' element={<RentCalendar />} />
            <Route path='/amount' element={<ShowStock />} />
            <Route path='/todos' element={<Todos />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
