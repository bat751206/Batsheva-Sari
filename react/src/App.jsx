import Accounts from './accounts/Accounts'
import Incomes from './accounts/Incomes'
import Outcomes from './accounts/Outcomes'
import './App.css'
import Layout from './Components/Layout'
import RentCalendar from './Chalender/RentCalendar'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route path='/account' element={<Accounts />} />
            <Route path='/account/incomes' element={<Incomes />} />
            <Route path='/account/outcomes' element={<Outcomes />} />
            <Route path='/rents' element={<RentCalendar />} />
            <Route path='/stock' element={<Accounts />} />
            <Route path='/tasks' element={<Accounts />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
