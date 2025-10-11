import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginForm } from "./components/Login/Login";
import { RegisterForm } from "./components/Register/Register";
import { Home } from "./components/Home/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
