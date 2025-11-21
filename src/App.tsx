import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginForm } from "./pages/Login/Login";
import { RegisterForm } from "./pages/Register/Register";
import { HomePage } from "./pages/Home/HomePage";
import { PantryPage } from "./pages/Pantry/PantryPage";
import { HistoryPage } from "./pages/History/HistoryPage";
import { RecipeDetailPage } from "./pages/Recipes/RecipeDetailPage";
import { RecipesPage } from "./pages/Recipes/RecipesPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/pantry" element={<PantryPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
