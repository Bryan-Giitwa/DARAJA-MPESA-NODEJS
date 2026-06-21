import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import STKPush from './pages/STKPush'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<STKPush />} />
      </Routes>
    </Router>
  )
}

export default App
