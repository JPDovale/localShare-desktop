import '@styles/globals.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/Home';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
