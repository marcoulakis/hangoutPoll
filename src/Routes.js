import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './pages/App';


const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />

      <Route path="*" element={<div>Not Found: 404</div>} />
    </Routes>
  </BrowserRouter>
);

export { AppRouter };