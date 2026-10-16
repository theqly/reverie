import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CreateCollectionPage from './features/collections/CreateCollectionPage';
import EditCollectionPage from './features/collections/EditCollectionPage';
import CollectionViewPage from './features/collections/CollectionViewPage';
import CreatePinPage from './features/pins/CreatePinPage';
import PinViewPage from './features/pins/PinViewPage';
import EditPinPage from './features/pins/EditPinPage';
import MapPage from './features/map/MapPage';
import LikedPins from './pages/LikedPins';
import Profile from './features/profiles/Profile';
import LoginRedirect from './pages/LoginRedirect';
import Feed from './pages/Feed';
import AuthCallbackPage from './pages/AuthCallbackPage';


import { ToastProvider } from './pages/ToastProvider';

function App() {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/collection/create" element={<CreateCollectionPage />} />
          <Route path="/pin/create" element={<CreatePinPage />} />
          <Route path="/pin/edit/:id" element={<EditPinPage />} />
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/feed" element={<Feed />} />

          <Route path="/pin/:pinId" element={<PinViewPage />} />
          <Route path="/collection/:collectionId" element={<CollectionViewPage />} />
          <Route path="/collection/edit/:id" element={<EditCollectionPage />} />

          <Route path="/map" element={<MapPage />} />
          <Route path="/likes/feed" element={<LikedPins />} />
          <Route path="/profile/:id" element={<Profile />} />

          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </ToastProvider>
    </Router>
  );
}

export default App;
