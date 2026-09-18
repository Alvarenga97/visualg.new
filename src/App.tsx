import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import EditorPage from './pages/EditorPage'
import ExerciciosPage from './pages/ExerciciosPage'
import ExercicioPage from './pages/ExercicioPage'
import LoginPage from './pages/LoginPage'
import CadastroPage from './pages/CadastroPage'
import HistoricoPage from './pages/HistoricoPage'
import RankingPage from './pages/RankingPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/exercicios" element={<ExerciciosPage />} />
        <Route path="/exercicios/:id" element={<ExercicioPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/historico" element={<HistoricoPage />} />
        <Route path="/ranking" element={<RankingPage />} />
      </Route>
    </Routes>
  )
}