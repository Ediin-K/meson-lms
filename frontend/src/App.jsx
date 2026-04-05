import React from "react";
import Home from "./pages/Home.jsx";
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'swiper/css';

function App() {
  return (
    <BrowserRouter>
      <main className="flex min-h-dvh flex-col bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2]">
        <div
          id="main-content"
          className="flex min-h-dvh flex-col bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2]"
          tabIndex={-1}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;