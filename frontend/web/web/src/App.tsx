import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateCollectionPage from './pages/CreateCollectionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection/create" element={<CreateCollectionPage />} />
      </Routes>
    </Router>
  );
}

export default App;