import './App.css'
import { Route, Routes } from 'react-router-dom'
import { LoginForm } from './components/Login/Login'
import { RegisterForm } from './components/Register/Register'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm/>}/>
      <Route path="/register" element={<RegisterForm/>}/>

    </Routes>
  )
}

export default App
