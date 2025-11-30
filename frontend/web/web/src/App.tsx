import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateCollectionPage from './pages/CreateCollectionPage';
import CreatePinPage from './pages/CreatePinPage';
import MapPage from './pages/MapPage';
import LikedPins from './pages/LikedPins';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection/create" element={<CreateCollectionPage />} />
        <Route path="/pin/create" element={<CreatePinPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/likes/feed" element={<LikedPins />} />


      </Routes>
    </Router>
  );
}

export default App;