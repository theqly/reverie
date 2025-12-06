import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateCollectionPage from './pages/CreateCollectionPage';
import EditCollectionPage from './pages/EditCollectionPage';

import CreatePinPage from './pages/CreatePinPage';
import EditPinPage from './pages/EditPinPage';

import MapPage from './pages/MapPage';
import LikedPins from './pages/LikedPins';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection/create" element={<CreateCollectionPage />} />
        <Route path="/pin/create" element={<CreatePinPage />} />
        <Route path="/pin/edit" element={<EditPinPage />} />
        <Route path="/login" element={<LoginPage />} />


        <Route path="/collection/edit" element={<EditCollectionPage />} />

        <Route path="/map" element={<MapPage />} />
        <Route path="/likes/feed" element={<LikedPins />} />
        <Route path="/profile" element={<Profile />} />



      </Routes>
    </Router>
  );
}

export default App;